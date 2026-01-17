import { t } from "elysia";
import { db } from "../../core/db";

export const InterviewSlotStatus = t.UnionEnum(["VACANT", "FULL", "CLOSE"]);

export const InterviewSlotModel = {
  slot: t.Object({
    startTime: t.String({ format: "date-time" }),
    endTime: t.String({ format: "date-time" }),
    maxCandidates: t.Number({ minimum: 2 }),
    bookedCandidateIds: t.Array(t.String({ minLength: 24, maxLength: 24 })),
    status: InterviewSlotStatus,
    createdAt: t.String({ format: "date-time" }),
    updatedAt: t.Nullable(t.String({ format: "date-time" })),
  }),
  createSlotBody: t.Object({
    startTime: t.String({ format: "date-time" }),
    endTime: t.String({ format: "date-time" }),
    maxCandidates: t.Number({ minimum: 2 }),
    bookedCandidateIds: t.Array(t.String({ minLength: 24, maxLength: 24 })),
    status: InterviewSlotStatus,
    createdAt: t.String({ format: "date-time" }),
    updatedAt: t.Nullable(t.String({ format: "date-time" })),
  }),
};
export type InterviewSlot = typeof InterviewSlotModel.slot.static;

export type CreateInterviewSlotBody =
  typeof InterviewSlotModel.createSlotBody.static;

export const interviewSlotCol = (await db()).collection<InterviewSlot>(
  "interview_slot",
);
