import { t } from "elysia";
import { db } from "../../core/db";
import { InterviewRoom } from "../candidate/candidate.model";

export const InterviewQuestionModel = {
  interviewQuestion: t.Object({
    candidateId: t.String(),
    questionTitle: t.String(),
    answer: t.Optional(t.String()),
    score: t.Optional(t.Number({ minimum: 0, maximum: 10 })),
    audioFileName: t.Optional(t.String()),
    interviewRoom: InterviewRoom,
    createAt: t.String({ format: "date-time" }),
    updatedAt: t.Nullable(t.String({ format: "date-time" })),
  }),
  createInterviewQuestionBody: t.Object({
    questionTitle: t.String(),
    answer: t.Optional(t.String()),
    score: t.Optional(t.Number({ minimum: 0, maximum: 10 })),
    interviewRoom: InterviewRoom,
  }),
};
export type InterViewQuestion =
  typeof InterviewQuestionModel.interviewQuestion.static;

export type CreateInterViewQuestBody =
  typeof InterviewQuestionModel.createInterviewQuestionBody.static;

export const interviewQuestionsCol = (await db()).collection<InterViewQuestion>(
  "interview_questions",
);
