import { ClientSession, ObjectId } from "mongodb";
import {
  CreateInterviewSlotBody,
  interviewSlotCol,
} from "./interviewSlot.model";
import {
  AlreadyHasSlotError,
  BadTimeSlotError,
  CandidateNotFoundError,
  HasNoSlotError,
  InterviewSlotFullError,
  InterviewSlotNotFoundError,
  InterviewSlotUnavailableError,
  NotInSlotError,
  SlotTimeOverlapError,
} from "../../core/errors";
import { candidatesCol } from "../candidate/candidate.model";
import { client, db } from "../../core/db";
import { AuditLogController } from "../auditLog/audit.controller";
import { AuditMeta } from "../auditLog/audit.model";
import { AuditUtils } from "../auditLog/audit.utils";
import { CandidateController } from "../candidate/candidate.controller";

export class InterviewSlotService {
  constructor(
    private auditController: AuditLogController,
    private candidateController: CandidateController
  ) {}

  async getAll(isAdmin = false) {
    const projection = {
      bookedCandidateIds: 0,
      createdAt: 0,
      updatedAt: 0,
    };

    const result = await interviewSlotCol
      .find({}, !isAdmin ? { projection } : undefined)
      .toArray();
    return result;
  }

  async createSlot(data: CreateInterviewSlotBody, meta: AuditMeta) {
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

    const result = await interviewSlotCol.insertOne({
      ...data,
      createdAt: new Date(),
      updatedAt: null,
    });
    if (!result) return result;
    this.auditController.audit({
      ...meta,
      action: "ADD_INTERVIEW_SLOT",
      changes: {
        before: null,
        after: data,
      },
      target: {
        type: "INTERVIEW_SLOT",
        id: result.insertedId.toString(),
      },
    });

    return result;
  }

  async deleteById(slotId: string, meta: AuditMeta) {
    const _id = new ObjectId(slotId);
    const result = await interviewSlotCol.findOneAndDelete(
      { _id },
      {
        projection: {
          startTime: 1,
          endTime: 1,
          maxCandidates: 1,
          bookedCandidateIds: 1,
        },
      }
    );
    if (!result) return result;

    this.auditController.audit({
      ...meta,
      action: "DELETE_INTERVIEW_SLOT",
      changes: {
        before: result,
        after: null,
      },
      target: {
        type: "INTERVIEW_SLOT",
        id: slotId,
      },
    });
    return result;
  }

  private async _addToSlot(
    candidateId: string,
    slotId: string,
    session: ClientSession
  ) {
    const slotObjectId = new ObjectId(slotId);
    const candidate = await this.candidateController.getCandidate(
      candidateId,
      session
    );

    if (candidate.interviewSlotId) throw new AlreadyHasSlotError();

    const slotBefore = await interviewSlotCol.findOne(
      { _id: slotObjectId },
      { session }
    );

    if (!slotBefore) throw new InterviewSlotNotFoundError();
    if (slotBefore.status === "CLOSE")
      throw new InterviewSlotUnavailableError();

    const nextStatus =
      slotBefore.bookedCandidateIds.length + 1 >= slotBefore.maxCandidates
        ? "FULL"
        : slotBefore.status;

    const slotAfter = await interviewSlotCol.findOneAndUpdate(
      {
        _id: slotObjectId,
        status: { $ne: "CLOSE" },
        $expr: {
          $lt: [{ $size: "$bookedCandidateIds" }, "$maxCandidates"],
        },
      },
      {
        $addToSet: { bookedCandidateIds: candidateId },
        $set: { status: nextStatus },
      },
      { session, returnDocument: "after" }
    );

    if (!slotAfter) throw new InterviewSlotFullError();

    await this.candidateController.assignInterviewSlot(
      candidateId,
      slotId,
      session
    );

    return { slotBefore, slotAfter };
  }

  private async _removeFromSlot(
    candidateId: string,
    slotId: string,
    session: ClientSession
  ) {
    const slotObjectId = new ObjectId(slotId);
    const candidate = await this.candidateController.getCandidate(
      candidateId,
      session
    );

    if (!candidate) throw new CandidateNotFoundError();
    if (!candidate.interviewSlotId) throw new HasNoSlotError();

    const slotBefore = await interviewSlotCol.findOne(
      { _id: slotObjectId },
      { session }
    );

    if (!slotBefore) throw new InterviewSlotNotFoundError();
    if (slotBefore.status === "CLOSE")
      throw new InterviewSlotUnavailableError();

    if (!slotBefore.bookedCandidateIds.includes(candidateId)) {
      throw new NotInSlotError();
    }

    const nextStatus =
      slotBefore.bookedCandidateIds.length - 1 < slotBefore.maxCandidates
        ? "VACANT"
        : slotBefore.status;

    const slotAfter = await interviewSlotCol.findOneAndUpdate(
      {
        _id: slotObjectId,
        bookedCandidateIds: candidateId,
      },
      {
        $pull: { bookedCandidateIds: candidateId },
        $set: { status: nextStatus },
      },
      { session, returnDocument: "after" }
    );

    if (!slotAfter) {
      throw new NotInSlotError();
    }

    await this.candidateController.unAssignInterviewSlot(candidateId, session);

    return { slotBefore, slotAfter };
  }

  async addCandidateToSlot(
    candidateId: string,
    slotId: string,
    meta: AuditMeta
  ) {
    const session = (await client()).startSession();
    try {
      const result = await session.withTransaction(async () => {
        return await this._addToSlot(candidateId, slotId, session);
      });

      if (!result) {
        throw new Error("Transaction completed without result");
      }

      const changes = AuditUtils.calculateDiff(
        result.slotBefore,
        result.slotAfter
      );

      this.auditController.audit({
        ...meta,
        action: "ADD_CANDIDATE_TO_INTERVIEW_SLOT",
        target: {
          type: "INTERVIEW_SLOT",
          id: slotId,
        },
        changes: {
          before: changes.before,
          after: changes.after,
        },
      });

      return result;
    } finally {
      await session.endSession();
    }
  }

  async removeCandidateFromSlot(
    candidateId: string,
    slotId: string,
    meta: AuditMeta
  ) {
    const session = (await client()).startSession();

    try {
      const result = await session.withTransaction(async () => {
        return await this._removeFromSlot(candidateId, slotId, session);
      });

      if (!result) {
        throw new Error("Transaction completed without result");
      }

      this.auditController.audit({
        ...meta,
        action: "REMOVE_CANDIDATE_FROM_INTERVIEW_SLOT",
        target: {
          type: "INTERVIEW_SLOT",
          id: slotId,
        },
        changes: AuditUtils.calculateDiff(result.slotBefore, result.slotAfter),
      });

      return result;
    } finally {
      await session.endSession();
    }
  }

  async changeAssignSlot(
    candidateId: string,
    newSlotId: string,
    meta: AuditMeta
  ) {
    const session = (await client()).startSession();

    try {
      const result = await session.withTransaction(async () => {
        const candidate = await this.candidateController.getCandidate(
          candidateId,
          session
        );
        const oldSlot = candidate.interviewSlotId;
        if (!oldSlot) throw new HasNoSlotError();
        const removeBf = await this._removeFromSlot(
          candidateId,
          oldSlot,
          session
        );
        const addBf = await this._addToSlot(candidateId, newSlotId, session);
        return { removeBf, addBf };
      });

      if (!result) {
        throw new Error("Transaction completed without result");
      }

      this.auditController.audit({
        ...meta,
        action: "CHANGE_INTERVIEW_SLOT",
        target: {
          type: "INTERVIEW_SLOT",
          id: newSlotId,
        },
        changes: AuditUtils.calculateDiff(
          result.addBf.slotBefore,
          result.addBf.slotAfter
        ),
      });

      return result;
    } finally {
      await session.endSession();
    }
  }
}
