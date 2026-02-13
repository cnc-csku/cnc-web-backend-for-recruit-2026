import { t } from "elysia";
import { db } from "../../core/db";

const QuestionItem = t.Object({
  title: t.String(),
  answer: t.Optional(t.String()),
  score: t.Optional(t.Number({ minimum: 0, maximum: 10 })),
});

const ReviewerScore = t.Object({
  reviewer: t.String(),
  score: t.Number({ minimum: 0, maximum: 10 }),
});

export const InterviewQuestionModel = {
  interviewQuestion: t.Object({
    candidateId: t.String(),
    questions: t.Object({
      attitude: t.Array(QuestionItem),
      technical: t.Array(QuestionItem),
    }),
    voices: t.Object({
      technical: t.Optional(t.String()),
      attitude: t.Optional(t.String()),
    }),
    reviewers: t.Object({
      technical: t.Array(ReviewerScore),
      attitude: t.Array(ReviewerScore),
    }),
    createAt: t.String({ format: "date-time" }),
    updatedAt: t.Nullable(t.String({ format: "date-time" })),
  }),
  addQuestionBody: t.Object({
    room: t.Union([t.Literal("attitude"), t.Literal("technical")]),
    title: t.String(),
    answer: t.Optional(t.String()),
    score: t.Optional(t.Number({ minimum: 0, maximum: 10 })),
  }),
  addReviewerBody: t.Object({
    room: t.Union([t.Literal("attitude"), t.Literal("technical")]),
    reviewer: t.String(),
    score: t.Number({ minimum: 0, maximum: 10 }),
  }),
  updateVoiceBody: t.Object({
    room: t.Union([t.Literal("attitude"), t.Literal("technical")]),
    voice: t.String(),
  }),
};

export type InterViewQuestion =
  typeof InterviewQuestionModel.interviewQuestion.static;

export type AddQuestionBody =
  typeof InterviewQuestionModel.addQuestionBody.static;

export type AddReviewerBody =
  typeof InterviewQuestionModel.addReviewerBody.static;

export type UpdateVoiceBody =
  typeof InterviewQuestionModel.updateVoiceBody.static;

export const interviewQuestionsCol = (await db()).collection<InterViewQuestion>(
  "interview_questions",
);
