import { t } from "elysia";
import { db } from "../../core/db";

export const InterviewSlotStatus = t.UnionEnum(["VACANT", "FULL", "CLOSE"]);

export const InterviewSlotModel = {
  slot: t.Object({
    startTime: t.Date(),
    endTime: t.Date(),
    maxCandidates: t.Number({ minimum: 2 }),
    bookedCandidateIds: t.Array(t.String({ minLength: 24, maxLength: 24 })),
    status: InterviewSlotStatus,
    createdAt: t.Date(),
    updatedAt: t.Nullable(t.Date()),
  }),
  createSlotBody: t.Object({
    startTime: t.Date(),
    endTime: t.Date(),
    maxCandidates: t.Number({ minimum: 2 }),
    bookedCandidateIds: t.Array(t.String({ minLength: 24, maxLength: 24 })),
    status: InterviewSlotStatus,
    createdAt: t.Date(),
    updatedAt: t.Nullable(t.Date()),
  }),
  addCandidateBody: t.Object({
    candidateId: t.String({ minLength: 24, maxLength: 24 }),
  }),
};
export type InterviewSlot = typeof InterviewSlotModel.slot.static;

export type CreateInterviewSlotBody =
  typeof InterviewSlotModel.createSlotBody.static;

export const interviewSlotCol = (await db()).collection<InterviewSlot>(
  "interview_slot"
);
