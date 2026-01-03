import { ObjectId } from "mongodb";
import { db } from "../../core/db";
import {
  CreateInterViewQuestBody,
  InterViewQuestion,
  interviewQuestionsCol,
} from "./interviewQuestion.model";

export class InterviewQuestionService {
  async getByCandidateId(candidateId: string) {
    return await interviewQuestionsCol
      .find({ candidateId: candidateId })
      .toArray();
  }

  async deleteById(questionId: string) {
    const _id = new ObjectId(questionId);
    return await interviewQuestionsCol.deleteOne({ _id });
  }

  async createInterViewQuestion(
    candidateId: string,
    data: Omit<CreateInterViewQuestBody, "candidateId">
  ) {
    const payload: InterViewQuestion = {
      ...data,
      candidateId: candidateId,
      createAt: new Date(),
      updatedAt: null,
    };
    return await interviewQuestionsCol.insertOne(payload);
  }

  async updateInterViewQuestion(
    questionId: string,
    data: Omit<CreateInterViewQuestBody, "candidateId">
  ) {
    const _id = new ObjectId(questionId);
    const payload: Omit<InterViewQuestion, "candidateId" | "createAt"> = {
      questionTitle: data.questionTitle,
      answer: data.answer,
      score: data.score,
      updatedAt: new Date(),
    };
    return await interviewQuestionsCol.updateOne(
      { _id },
      {
        $set: { ...payload },
      }
    );
  }
}
