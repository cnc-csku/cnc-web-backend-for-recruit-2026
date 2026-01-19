import { ObjectId } from "mongodb";
import { db } from "../../core/db";
import {
  CreateInterViewQuestBody,
  InterViewQuestion,
  interviewQuestionsCol,
} from "./interviewQuestion.model";
import { AuditMeta } from "../auditLog/audit.model";
import { AuditLogController } from "../auditLog/audit.controller";
import { AuditUtils } from "../auditLog/audit.utils";

export class InterviewQuestionService {
  constructor(private auditController: AuditLogController) {}
  async getByCandidateId(candidateId: string) {
    return await interviewQuestionsCol
      .find({ candidateId: candidateId })
      .toArray();
  }

  async deleteById(questionId: string, meta: AuditMeta) {
    const _id = new ObjectId(questionId);
    const result = await interviewQuestionsCol.findOneAndDelete(
      { _id },
      {
        projection: {
          questionTitle: 1,
          answer: 1,
          score: 1,
        },
      },
    );
    if (!result) return result;
    this.auditController.audit({
      ...meta,
      action: "DELETE_QUESTION",
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

  async createInterViewQuestion(
    candidateId: string,
    data: Omit<CreateInterViewQuestBody, "candidateId">,
    meta: AuditMeta,
  ) {
    const payload: InterViewQuestion = {
      ...data,
      candidateId: candidateId,
      createAt: new Date().toISOString(),
      updatedAt: null,
    };

    const result = await interviewQuestionsCol.insertOne(payload);

    this.auditController.audit({
      ...meta,
      action: "ADD_QUESTION",
      changes: {
        before: null,
        after: payload,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: result.insertedId.toString(),
      },
    });

    return result;
  }

  async updateInterViewQuestion(
    questionId: string,
    data: Omit<CreateInterViewQuestBody, "candidateId">,
    meta: AuditMeta,
  ) {
    const _id = new ObjectId(questionId);
    const payload: Omit<InterViewQuestion, "candidateId" | "createAt"> = {
      questionTitle: data.questionTitle,
      answer: data.answer,
      score: data.score,
      interviewRoom: data.interviewRoom,
      updatedAt: new Date().toISOString(),
    };

    const before = await interviewQuestionsCol.findOne({ _id });
    const result = await interviewQuestionsCol.findOneAndUpdate(
      { _id },
      {
        $set: { ...payload },
      },
      { returnDocument: "after" },
    );
    if (!result) return result;

    const changes = AuditUtils.calculateDiff(before, result);
    this.auditController.audit({
      ...meta,
      action: "UPDATE_QUESTION",
      changes: {
        before: changes.before,
        after: changes.after,
      },
      target: {
        type: "INTERVIEW_QUESTION",
        id: questionId,
      },
    });
    return result;
  }
}
