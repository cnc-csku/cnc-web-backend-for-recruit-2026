import { t } from "elysia";
import { db } from "../../core/db";

export const InterviewQuestionModel = {
  interviewQuestion: t.Object({
    candidateId: t.String(),
    questionTitle: t.String(),
    answer: t.Optional(t.String()),
    score: t.Optional(t.Number({ minimum: 0, maximum: 10 })),
    audioFileName: t.Optional(t.String()),
    createAt: t.Date(),
    updatedAt: t.Nullable(t.Date()),
  }),
  createInterviewQuestionBody: t.Object({
    questionTitle: t.String(),
    answer: t.Optional(t.String()),
    score: t.Optional(t.Number({ minimum: 0, maximum: 10 })),
  }),
};
export type InterViewQuestion =
  typeof InterviewQuestionModel.interviewQuestion.static;

export type CreateInterViewQuestBody =
  typeof InterviewQuestionModel.createInterviewQuestionBody.static;

export const interviewQuestionsCol = (await db()).collection<InterViewQuestion>(
  "interview_questions"
);
