import { DomainError } from "../../core/errors";
import { AuditMeta } from "../auditLog/audit.model";
import { CreateInterviewSlotBody } from "./InterviewSlot.model";
import { InterviewSlotService } from "./interviewSlot.service";

export class InterviewSlotController {
  constructor(private service: InterviewSlotService) {}
  async getAllSlot() {
    const result = await this.service.getAll();
    return result;
  }

  async createSlot(data: CreateInterviewSlotBody, meta: AuditMeta) {
    return await this.service.createSlot(data,meta);
  }

  async deleteSlot(slotId: string, meta: AuditMeta) {
    return await this.service.deleteById(slotId,meta);
  }

  async addCandidateToSlot(
    candidateId: string,
    slotId: string,
    meta: AuditMeta
  ) {
    try {
      return await this.service.addCandidateToSlot(candidateId, slotId,meta);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      console.log(err);

      throw new Error("Failed to add candidate");
    }
  }

  async removeCandidateFromSlot(
    candidateId: string,
    slotId: string,
    meta: AuditMeta
  ) {
    try {
      return await this.service.removeCandidateFromSlot(candidateId, slotId,meta);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      console.log(err);

      throw new Error("Failed to remove candidate");
    }
  }
}
