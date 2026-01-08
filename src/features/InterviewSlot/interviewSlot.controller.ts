import { DomainError } from "../../core/errors";
import { AuditMeta } from "../auditLog/audit.model";
import { CreateInterviewSlotBody } from "./InterviewSlot.model";
import { InterviewSlotService } from "./interviewSlot.service";

export class InterviewSlotController {
  constructor(private service: InterviewSlotService) {}
  async getAllSlot(isAdmin = false) {
    const result = await this.service.getAll(isAdmin);
    return result;
  }

  async createSlot(data: CreateInterviewSlotBody, meta: AuditMeta) {
    return await this.service.createSlot(data, meta);
  }

  async deleteSlot(slotId: string, meta: AuditMeta) {
    return await this.service.deleteById(slotId, meta);
  }

  async assignCandidateToSlot(
    candidateId: string,
    slotId: string,
    meta: AuditMeta
  ) {
    try {
      return await this.service.addCandidateToSlot(candidateId, slotId, meta);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      console.log(err);

      throw new Error("Failed to add candidate");
    }
  }

  async unAssignCandidateFromSlot(
    candidateId: string,
    slotId: string,
    meta: AuditMeta
  ) {
    try {
      return await this.service.removeCandidateFromSlot(
        candidateId,
        slotId,
        meta
      );
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      console.log(err);

      throw new Error("Failed to remove candidate");
    }
  }

  async changeCandidateAssignedSlot(
    candidateId: string,
    slotId: string,
    meta: AuditMeta
  ) {
    try {
      return await this.service.removeCandidateFromSlot(
        candidateId,
        slotId,
        meta
      );
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      console.log(err);

      throw new Error("Failed to remove candidate");
    }
  }
}
