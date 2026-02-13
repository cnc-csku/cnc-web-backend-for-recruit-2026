import { ObjectId } from "mongodb";
import { db } from "../../core/db";
import {
  AddQuestionBody,
  AddReviewerBody,
  InterViewQuestion,
  interviewQuestionsCol,
  UpdateVoiceBody,
} from "./interviewQuestion.model";
import { AuditMeta } from "../auditLog/audit.model";
import { AuditLogController } from "../auditLog/audit.controller";
import { AuditUtils } from "../auditLog/audit.utils";

export class InterviewQuestionService {
  constructor(private auditController: AuditLogController) {}

  async getByCandidateId(candidateId: string) {
    return await interviewQuestionsCol.findOne({ candidateId });
  }

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
      updatedAt: null,
    };

    const result = await interviewQuestionsCol.insertOne(payload);

    this.auditController.audit({
      ...meta,
      action: "INIT_INTERVIEW_QUESTIONS",
      changes: {
        before: null,
        after: payload,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: result.insertedId.toString(),
      },
    });

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
        $set: { updatedAt: new Date().toISOString() },
      },
      { returnDocument: "after" },
    );

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

    const changes = AuditUtils.calculateDiff(before, result);
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
        before: deletedQuestion,
        after: null,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: result._id.toString(),
      },
    });

    return result;
  }

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
        $set: { updatedAt: new Date().toISOString() },
      },
      { returnDocument: "after" },
    );

    if (!result) return null;

    this.auditController.audit({
      ...meta,
      action: "ADD_REVIEWER",
      changes: {
        before: before.reviewers[data.room],
        after: result.reviewers[data.room],
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: result._id.toString(),
      },
    });

    return result;
  }

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

    this.auditController.audit({
      ...meta,
      action: "UPDATE_VOICE",
      changes: {
        before: before.voices[data.room],
        after: data.voice,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: result._id.toString(),
      },
    });

    return result;
  }

  async deleteByCandidateId(candidateId: string, meta: AuditMeta) {
    const result = await interviewQuestionsCol.findOneAndDelete({
      candidateId,
    });

    if (!result) return null;

    this.auditController.audit({
      ...meta,
      action: "DELETE_INTERVIEW_QUESTIONS",
      changes: {
        before: result,
        after: null,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: result._id.toString(),
      },
    });

    return result;
  }
}
