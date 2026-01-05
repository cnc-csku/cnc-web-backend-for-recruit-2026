import { DomainError } from "../../core/errors";
import { CreateInterviewSlotBody } from "./InterviewSlot.model";
import { InterviewSlotService } from "./interviewSlot.service";

export class InterviewSlotController {
  constructor(private service: InterviewSlotService) {}
  async getAllSlot() {
    const result = await this.service.getAll();
    return result;
  }

  async createSlot(data: CreateInterviewSlotBody) {
    return await this.service.createSlot(data);
  }

  async deleteSlot(slotId: string) {
    return await this.service.deleteById(slotId);
  }

  async addCandidateToSlot(candidateId: string, slotId: string) {
    try {
      return await this.service.addCandidateToSlot(candidateId, slotId);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      console.log(err);

      throw new Error("Failed to add candidate");
    }
  }

  async removeCandidateFromSlot(candidateId: string, slotId: string) {
    try {
      return await this.service.removeCandidateFromSlot(candidateId, slotId);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      console.log(err);

      throw new Error("Failed to remove candidate");
    }
  }
}
