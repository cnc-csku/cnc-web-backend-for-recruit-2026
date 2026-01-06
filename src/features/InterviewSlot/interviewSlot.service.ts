import { ObjectId } from "mongodb";
import {
  CreateInterviewSlotBody,
  interviewSlotCol,
  InterviewSlotStatus,
} from "./InterviewSlot.model";
import {
  AlreadyHasSlotError,
  BadTimeSlotError,
  CandidateNotFoundError,
  HasNoSlotError,
  InterviewSlotFullError,
  InterviewSlotNotFoundError,
  InterviewSlotUnavailableError,
  SlotTimeDuplicateError,
  SlotTimeOverlapError,
} from "../../core/errors";
import { candidatesCol } from "../candidate/candidate.model";
import { client, db } from "../../core/db";
import { AuditLogController } from "../auditLog/audit.controller";

export class InterviewSlotService {
  constructor(private auditController: AuditLogController) {}

  async getAll() {
    const result = await interviewSlotCol.find({}).toArray();
    return result;
  }

  async createSlot(data: CreateInterviewSlotBody) {
    if (data.startTime >= data.endTime) {
      throw new BadTimeSlotError();
    }
    const overlapSlot = await interviewSlotCol.findOne({
      startTime: { $lt: data.endTime },
      endTime: { $gt: data.startTime },
    });

    if (overlapSlot) {
      throw new SlotTimeOverlapError();
    }

    return await interviewSlotCol.insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: null,
    });
  }

  async deleteById(slotId: string) {
    const _id = new ObjectId(slotId);
    return await interviewSlotCol.findOneAndDelete({ _id });
  }

  async addCandidateToSlot(candidateId: string, slotId: string) {
    const session = (await client()).startSession();
    const slotObjectId = new ObjectId(slotId);
    const candidateObjectId = new ObjectId(candidateId);

    const candidate = await candidatesCol.findOne(
      { _id: candidateObjectId },
      { session }
    );
    if (!candidate) throw new CandidateNotFoundError();

    if (candidate?.interviewSlotId) {
      throw new AlreadyHasSlotError();
    }

    try {
      return await session.withTransaction(async () => {
        const slot = await interviewSlotCol.findOne(
          { _id: slotObjectId },
          { session }
        );
        if (!slot) throw new InterviewSlotNotFoundError();
        if (slot.status == "CLOSE") throw new InterviewSlotUnavailableError();
        if (
          slot.bookedCandidateIds.length >= slot.maxCandidates &&
          slot.status == "FULL"
        )
          throw new InterviewSlotFullError();

        const newStatus =
          slot.bookedCandidateIds.length + 1 >= slot.maxCandidates
            ? "FULL"
            : slot.status;

        await interviewSlotCol.updateOne(
          { _id: slotObjectId },
          {
            $push: { bookedCandidateIds: candidateId },
            $set: { status: newStatus },
          },
          { session }
        );

        await candidatesCol.updateOne(
          { _id: candidateObjectId },
          { $set: { selectedInterviewSlotId: slotId } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }
  }

  async removeCandidateFromSlot(candidateId: string, slotId: string) {
    const mongoClient = await client();
    const session = mongoClient.startSession();
    const slotObjectId = new ObjectId(slotId);
    const candidateObjectId = new ObjectId(candidateId);

    const candidate = await candidatesCol.findOne(
      { _id: candidateObjectId },
      { session }
    );
    if (!candidate) throw new CandidateNotFoundError();

    if (!candidate.interviewSlotId) throw new HasNoSlotError();
    try {
      return await session.withTransaction(async () => {
        const slot = await interviewSlotCol.findOne(
          { _id: slotObjectId },
          { session }
        );
        if (!slot) throw new InterviewSlotNotFoundError();
        if (slot.status === "CLOSE") throw new InterviewSlotUnavailableError();

        if (!slot.bookedCandidateIds.includes(candidateId)) return;
        const updatedBookedCandidateIds = slot.bookedCandidateIds.filter(
          (id) => id !== candidateId
        );

        const newStatus =
          updatedBookedCandidateIds.length < slot.maxCandidates
            ? "VACANT"
            : slot.status;

        await interviewSlotCol.updateOne(
          { _id: slotObjectId },
          {
            $set: {
              bookedCandidateIds: updatedBookedCandidateIds,
              status: newStatus,
            },
          },
          { session }
        );

        await candidatesCol.updateOne(
          { _id: candidateObjectId },
          { $unset: { selectedInterviewSlotId: "" } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }
  }
}
