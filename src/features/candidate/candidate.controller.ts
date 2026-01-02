import { Elysia, t } from "elysia";
import { CandidateService } from "./candidate.service";
import { CreateCandidateBody } from "./candidate.model";
import {
  CandidateNotFoundError,
  DomainError,
  DuplicateCandidateError,
  EditLimitExceededError,
} from "../../core/errors";

export class CandidateController {
  constructor(private service: CandidateService) {}

  async getCandidate(id: string) {
    return await this.service.findById(id);
  }

  async getAllCandidates() {
    return await this.service.getAlls();
  }

  async updateCandidate(
    candidateId: string,
    data: Partial<CreateCandidateBody>
  ) {
    try {
      return await this.service.updateCandidate(candidateId, data);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to create candidate");
    }
  }

  async createCandidate(data: CreateCandidateBody) {
    try {
      return await this.service.createCandidate(data);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to create candidate");
    }
  }
}
