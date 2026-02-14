import { t } from "elysia";
import { db } from "../../core/db";

// ─────────────────────────────────────
// Sub-schemas
// ─────────────────────────────────────

const QuestionItem = t.Object({
  title: t.String(),
  answer: t.Optional(t.String()),
  score: t.Optional(t.Number({ minimum: 0, maximum: 10 })),
});

const ReviewerItem = t.Object({
  name: t.String(),
  score: t.Number({ minimum: 0, maximum: 10 }),
  notes: t.String(),
  room: t.Union([t.Literal("TECHNICAL"), t.Literal("ATTITUDE")]),
});

const Audios = t.Object({
  technical: t.Nullable(t.String()),
  attitude: t.Nullable(t.String()),
});

// ─────────────────────────────────────
// Main document schema
// ─────────────────────────────────────

const InterviewQuestionSchema = t.Object({
  candidateId: t.String(),
  questions: t.Object({
    technical: t.Array(QuestionItem),
    attitude: t.Array(QuestionItem),
  }),
  reviewers: t.Array(ReviewerItem),
  audios: Audios,
  createdAt: t.String({ format: "date-time" }),
  updatedAt: t.Nullable(t.String({ format: "date-time" })),
});

// ─────────────────────────────────────
// Request body schemas
// ─────────────────────────────────────

export const InterviewQuestionModel = {
  interviewQuestion: InterviewQuestionSchema,

  /** Body for adding a single question to a room */
  addQuestionBody: t.Object({
    room: t.Union([t.Literal("technical"), t.Literal("attitude")]),
    title: t.String(),
    answer: t.Optional(t.String()),
    score: t.Optional(t.Number({ minimum: 0, maximum: 10 })),
  }),

  /** Body for updating a single question (all fields optional) */
  updateQuestionBody: t.Object({
    title: t.Optional(t.String()),
    answer: t.Optional(t.String()),
    score: t.Optional(t.Number({ minimum: 0, maximum: 10 })),
  }),

  /** Body for adding a reviewer */
  addReviewerBody: t.Object({
    name: t.String(),
    score: t.Number({ minimum: 0, maximum: 10 }),
    notes: t.String(),
    room: t.Union([t.Literal("TECHNICAL"), t.Literal("ATTITUDE")]),
  }),

  /** Body for updating audios (voice recordings) */
  updateVoiceBody: t.Object({
    technical: t.Optional(t.Nullable(t.String())),
    attitude: t.Optional(t.Nullable(t.String())),
  }),
};

// ─────────────────────────────────────
// Types
// ─────────────────────────────────────

export type InterviewQuestion =
  typeof InterviewQuestionModel.interviewQuestion.static;

export type QuestionItemType = typeof QuestionItem.static;

export type ReviewerItemType = typeof ReviewerItem.static;

export type AddQuestionBody =
  typeof InterviewQuestionModel.addQuestionBody.static;

export type UpdateQuestionBody =
  typeof InterviewQuestionModel.updateQuestionBody.static;

export type AddReviewerBody =
  typeof InterviewQuestionModel.addReviewerBody.static;

export type UpdateVoiceBody =
  typeof InterviewQuestionModel.updateVoiceBody.static;

// ─────────────────────────────────────
// Collection
// ─────────────────────────────────────

export const interviewQuestionsCol = (await db()).collection<InterviewQuestion>(
  "interview_questions",
);
