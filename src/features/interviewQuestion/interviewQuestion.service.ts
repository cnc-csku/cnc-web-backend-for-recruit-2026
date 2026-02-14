import { ObjectId } from "mongodb";
import {
  type InterviewQuestion,
  type AddQuestionBody,
  type UpdateQuestionBody,
  type AddReviewerBody,
  type UpdateVoiceBody,
  interviewQuestionsCol,
} from "./interviewQuestion.model";
import { AuditMeta } from "../auditLog/audit.model";
import { AuditLogController } from "../auditLog/audit.controller";
import { AuditUtils } from "../auditLog/audit.utils";

export class InterviewQuestionService {
  constructor(private auditController: AuditLogController) {}

  // ─────────────────────────────────────
  // Init / Get
  // ─────────────────────────────────────

  /**
   * Get the interview document for a candidate.
   * Returns null if no document exists yet.
   */
  async getByCandidateId(candidateId: string) {
    return await interviewQuestionsCol.findOne({ candidateId });
  }

  /**
   * Initialise an empty interview document for a candidate.
   * If one already exists, return it instead of creating a duplicate.
   */
  async initInterviewDocument(candidateId: string, meta: AuditMeta) {
    const existing = await interviewQuestionsCol.findOne({ candidateId });
    if (existing) return existing;

    const payload: InterviewQuestion = {
      candidateId,
      questions: {
        technical: [],
        attitude: [],
      },
      reviewers: [],
      audios: {
        technical: null,
        attitude: null,
      },
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };

    const result = await interviewQuestionsCol.insertOne(payload);

    this.auditController.audit({
      ...meta,
      action: "INIT_INTERVIEW",
      changes: {
        before: null,
        after: payload,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: result.insertedId.toString(),
      },
    });

    return { _id: result.insertedId, ...payload };
  }

  // ─────────────────────────────────────
  // Questions
  // ─────────────────────────────────────

  /**
   * Add a question to a specific room (technical | attitude).
   */
  async addQuestion(candidateId: string, data: AddQuestionBody, meta: AuditMeta) {
    const { room, title, answer, score } = data;
    const questionItem = { title, answer, score };

    const result = await interviewQuestionsCol.findOneAndUpdate(
      { candidateId },
      {
        $push: { [`questions.${room}`]: questionItem },
        $set: { updatedAt: new Date().toISOString() },
      },
      { returnDocument: "after" },
    );

    if (!result) throw new Error("Interview document not found for candidate");

    this.auditController.audit({
      ...meta,
      action: "ADD_QUESTION",
      changes: {
        before: null,
        after: { room, ...questionItem },
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: candidateId,
      },
    });

    return result;
  }

  /**
   * Update a question at a specific index within a room.
   */
  async updateQuestion(
    candidateId: string,
    room: "technical" | "attitude",
    index: number,
    data: UpdateQuestionBody,
    meta: AuditMeta,
  ) {
    const doc = await interviewQuestionsCol.findOne({ candidateId });
    if (!doc) throw new Error("Interview document not found for candidate");

    const questions = doc.questions[room];
    if (index < 0 || index >= questions.length) {
      throw new Error(`Question index ${index} out of range for room '${room}'`);
    }

    const before = { ...questions[index] };

    // Build $set fields for only the provided data
    const setFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (data.title !== undefined)
      setFields[`questions.${room}.${index}.title`] = data.title;
    if (data.answer !== undefined)
      setFields[`questions.${room}.${index}.answer`] = data.answer;
    if (data.score !== undefined)
      setFields[`questions.${room}.${index}.score`] = data.score;

    const result = await interviewQuestionsCol.findOneAndUpdate(
      { candidateId },
      { $set: setFields },
      { returnDocument: "after" },
    );

    if (!result) throw new Error("Failed to update question");

    this.auditController.audit({
      ...meta,
      action: "UPDATE_QUESTION",
      changes: {
        before: { room, index, ...before },
        after: { room, index, ...result.questions[room][index] },
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: candidateId,
      },
    });

    return result;
  }

  /**
   * Delete a question at a specific index within a room.
   * Uses $unset + $pull pattern to remove by index.
   */
  async deleteQuestion(
    candidateId: string,
    room: "technical" | "attitude",
    index: number,
    meta: AuditMeta,
  ) {
    const doc = await interviewQuestionsCol.findOne({ candidateId });
    if (!doc) throw new Error("Interview document not found for candidate");

    const questions = doc.questions[room];
    if (index < 0 || index >= questions.length) {
      throw new Error(`Question index ${index} out of range for room '${room}'`);
    }

    const deleted = questions[index];

    // Step 1: Set the element at the index to null
    await interviewQuestionsCol.updateOne(
      { candidateId },
      { $unset: { [`questions.${room}.${index}`]: 1 } },
    );

    // Step 2: Pull the null value from the array
    await interviewQuestionsCol.updateOne(
      { candidateId },
      {
        $pull: { [`questions.${room}`]: null as any },
        $set: { updatedAt: new Date().toISOString() },
      },
    );

    this.auditController.audit({
      ...meta,
      action: "DELETE_QUESTION",
      changes: {
        before: { room, index, ...deleted },
        after: null,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: candidateId,
      },
    });

    return deleted;
  }

  // ─────────────────────────────────────
  // Reviewers
  // ─────────────────────────────────────

  /**
   * Add a reviewer to the interview document.
   */
  async addReviewer(candidateId: string, data: AddReviewerBody, meta: AuditMeta) {
    const result = await interviewQuestionsCol.findOneAndUpdate(
      { candidateId },
      {
        $push: { reviewers: data },
        $set: { updatedAt: new Date().toISOString() },
      },
      { returnDocument: "after" },
    );

    if (!result) throw new Error("Interview document not found for candidate");

    this.auditController.audit({
      ...meta,
      action: "ADD_REVIEWER",
      changes: {
        before: null,
        after: data,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: candidateId,
      },
    });

    return result;
  }

  // ─────────────────────────────────────
  // Audios / Voice
  // ─────────────────────────────────────

  /**
   * Update the audio file references.
   */
  async updateVoice(candidateId: string, data: UpdateVoiceBody, meta: AuditMeta) {
    const doc = await interviewQuestionsCol.findOne({ candidateId });
    if (!doc) throw new Error("Interview document not found for candidate");

    const before = { ...doc.audios };

    const setFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (data.technical !== undefined)
      setFields["audios.technical"] = data.technical;
    if (data.attitude !== undefined)
      setFields["audios.attitude"] = data.attitude;

    const result = await interviewQuestionsCol.findOneAndUpdate(
      { candidateId },
      { $set: setFields },
      { returnDocument: "after" },
    );

    if (!result) throw new Error("Failed to update voice");

    this.auditController.audit({
      ...meta,
      action: "UPDATE_VOICE",
      changes: {
        before,
        after: result.audios,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: candidateId,
      },
    });

    return result;
  }

  // ─────────────────────────────────────
  // Delete entire document
  // ─────────────────────────────────────

  async deleteById(candidateId: string, meta: AuditMeta) {
    const result = await interviewQuestionsCol.findOneAndDelete({ candidateId });
    if (!result) return result;

    this.auditController.audit({
      ...meta,
      action: "DELETE_INTERVIEW",
      changes: {
        before: result,
        after: null,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: candidateId,
      },
    });

    return result;
  }
}
