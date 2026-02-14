import { ObjectId } from "mongodb";
import {
<<<<<<< HEAD
  AddQuestionBody,
  AddReviewerBody,
  InterViewQuestion,
=======
  type InterviewQuestion,
  type AddQuestionBody,
  type UpdateQuestionBody,
  type AddReviewerBody,
  type UpdateVoiceBody,
>>>>>>> release/v1.3
  interviewQuestionsCol,
  UpdateVoiceBody,
} from "./interviewQuestion.model";
import { AuditMeta } from "../auditLog/audit.model";
import { AuditLogController } from "../auditLog/audit.controller";
import { AuditUtils } from "../auditLog/audit.utils";

export class InterviewQuestionService {
  constructor(private auditController: AuditLogController) {}

<<<<<<< HEAD
=======
  // ─────────────────────────────────────
  // Init / Get
  // ─────────────────────────────────────

  /**
   * Get the interview document for a candidate.
   * Returns null if no document exists yet.
   */
>>>>>>> release/v1.3
  async getByCandidateId(candidateId: string) {
    return await interviewQuestionsCol.findOne({ candidateId });
  }

<<<<<<< HEAD
  async initForCandidate(candidateId: string, meta: AuditMeta) {
    const existing = await interviewQuestionsCol.findOne({ candidateId });
    if (existing) return existing;

    const payload: InterViewQuestion = {
      candidateId,
      questions: {
        attitude: [],
        technical: [],
      },
      voices: {
        technical: undefined,
        attitude: undefined,
      },
      reviewers: {
        technical: [],
        attitude: [],
      },
      createAt: new Date().toISOString(),
=======
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
>>>>>>> release/v1.3
      updatedAt: null,
    };

    const result = await interviewQuestionsCol.insertOne(payload);

    this.auditController.audit({
      ...meta,
<<<<<<< HEAD
      action: "INIT_INTERVIEW_QUESTIONS",
=======
      action: "INIT_INTERVIEW",
>>>>>>> release/v1.3
      changes: {
        before: null,
        after: payload,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: result.insertedId.toString(),
      },
    });

<<<<<<< HEAD
    return { ...payload, _id: result.insertedId };
  }

  async addQuestion(
    candidateId: string,
    data: AddQuestionBody,
    meta: AuditMeta,
  ) {
    const before = await interviewQuestionsCol.findOne({ candidateId });
    if (!before) return null;

    const questionItem = {
      title: data.title,
      answer: data.answer,
      score: data.score,
    };

    const updateField =
      data.room === "attitude"
        ? "questions.attitude"
        : "questions.technical";

    const result = await interviewQuestionsCol.findOneAndUpdate(
      { candidateId },
      {
        $push: { [updateField]: questionItem },
=======
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
>>>>>>> release/v1.3
        $set: { updatedAt: new Date().toISOString() },
      },
      { returnDocument: "after" },
    );
<<<<<<< HEAD

    if (!result) return null;

    this.auditController.audit({
      ...meta,
      action: "ADD_QUESTION",
      changes: {
        before: before.questions[data.room],
        after: result.questions[data.room],
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: result._id.toString(),
      },
    });

    return result;
  }

  async updateQuestion(
    candidateId: string,
    room: "attitude" | "technical",
    questionIndex: number,
    data: { title?: string; answer?: string; score?: number },
    meta: AuditMeta,
  ) {
    const before = await interviewQuestionsCol.findOne({ candidateId });
    if (!before) return null;

    const questions = before.questions[room];
    if (!questions[questionIndex]) return null;

    const updateFields: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    if (data.title !== undefined)
      updateFields[`questions.${room}.${questionIndex}.title`] = data.title;
    if (data.answer !== undefined)
      updateFields[`questions.${room}.${questionIndex}.answer`] = data.answer;
    if (data.score !== undefined)
      updateFields[`questions.${room}.${questionIndex}.score`] = data.score;

    const result = await interviewQuestionsCol.findOneAndUpdate(
      { candidateId },
      { $set: updateFields },
      { returnDocument: "after" },
    );

    if (!result) return null;
=======
>>>>>>> release/v1.3

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
      changes: changes,
      target: {
        type: "INTERVIEW_QUESTION",
        id: result._id.toString(),
      },
    });

    return result;
  }

  async deleteQuestion(
    candidateId: string,
    room: "attitude" | "technical",
    questionIndex: number,
    meta: AuditMeta,
  ) {
    const before = await interviewQuestionsCol.findOne({ candidateId });
    if (!before) return null;

    const questions = before.questions[room];
    if (!questions[questionIndex]) return null;

    const deletedQuestion = questions[questionIndex];
    const newQuestions = questions.filter((_, i) => i !== questionIndex);

    const updateField = room === "attitude" ? "questions.attitude" : "questions.technical";

    const result = await interviewQuestionsCol.findOneAndUpdate(
      { candidateId },
      {
        $set: { [updateField]: newQuestions, updatedAt: new Date().toISOString() },
      },
      { returnDocument: "after" },
    );

    if (!result) return null;

    this.auditController.audit({
      ...meta,
      action: "DELETE_QUESTION",
      changes: {
<<<<<<< HEAD
        before: deletedQuestion,
        after: null,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: result._id.toString(),
=======
        before: { room, index, ...before },
        after: { room, index, ...result.questions[room][index] },
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: candidateId,
>>>>>>> release/v1.3
      },
    });

    return result;
  }

<<<<<<< HEAD
  async addReviewer(
    candidateId: string,
    data: AddReviewerBody,
    meta: AuditMeta,
  ) {
    const before = await interviewQuestionsCol.findOne({ candidateId });
    if (!before) return null;

    const reviewerItem = {
      reviewer: data.reviewer,
      score: data.score,
    };

    const updateField =
      data.room === "attitude" ? "reviewers.attitude" : "reviewers.technical";

    const result = await interviewQuestionsCol.findOneAndUpdate(
      { candidateId },
      {
        $push: { [updateField]: reviewerItem },
=======
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
>>>>>>> release/v1.3
        $set: { updatedAt: new Date().toISOString() },
      },
      { returnDocument: "after" },
    );

<<<<<<< HEAD
    if (!result) return null;
=======
    if (!result) throw new Error("Interview document not found for candidate");
>>>>>>> release/v1.3

    this.auditController.audit({
      ...meta,
      action: "ADD_REVIEWER",
      changes: {
<<<<<<< HEAD
        before: before.reviewers[data.room],
        after: result.reviewers[data.room],
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: result._id.toString(),
=======
        before: null,
        after: data,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: candidateId,
>>>>>>> release/v1.3
      },
    });

    return result;
  }

<<<<<<< HEAD
  async updateVoice(
    candidateId: string,
    data: UpdateVoiceBody,
    meta: AuditMeta,
  ) {
    const before = await interviewQuestionsCol.findOne({ candidateId });
    if (!before) return null;

    const updateField =
      data.room === "attitude" ? "voices.attitude" : "voices.technical";

    const result = await interviewQuestionsCol.findOneAndUpdate(
      { candidateId },
      {
        $set: { [updateField]: data.voice, updatedAt: new Date().toISOString() },
      },
      { returnDocument: "after" },
    );

    if (!result) return null;
=======
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
>>>>>>> release/v1.3

    this.auditController.audit({
      ...meta,
      action: "UPDATE_VOICE",
      changes: {
<<<<<<< HEAD
        before: before.voices[data.room],
        after: data.voice,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: result._id.toString(),
=======
        before,
        after: result.audios,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: candidateId,
>>>>>>> release/v1.3
      },
    });

    return result;
  }

<<<<<<< HEAD
  async deleteByCandidateId(candidateId: string, meta: AuditMeta) {
    const result = await interviewQuestionsCol.findOneAndDelete({
      candidateId,
    });

    if (!result) return null;

    this.auditController.audit({
      ...meta,
      action: "DELETE_INTERVIEW_QUESTIONS",
=======
  // ─────────────────────────────────────
  // Delete entire document
  // ─────────────────────────────────────

  async deleteById(candidateId: string, meta: AuditMeta) {
    const result = await interviewQuestionsCol.findOneAndDelete({ candidateId });
    if (!result) return result;

    this.auditController.audit({
      ...meta,
      action: "DELETE_INTERVIEW",
>>>>>>> release/v1.3
      changes: {
        before: result,
        after: null,
      },
      target: {
        type: "INTERVIEW_QUESTION",
<<<<<<< HEAD
        id: result._id.toString(),
=======
        id: candidateId,
>>>>>>> release/v1.3
      },
    });

    return result;
  }
}
