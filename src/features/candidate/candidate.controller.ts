import { Elysia, t } from "elysia";
import { CandidateService } from "./candidate.service";
import { CreateCandidateBody } from "./candidate.model";
import { DuplicateCandidateError } from "../../core/errors";

export class CandidateController {
  constructor(private service: CandidateService) {}

  async getAllCandidates() {
    return await this.service.getAlls();
  }

  async createCandidate(data: CreateCandidateBody) {
    try {
      return await this.service.createCandidate(data);
    } catch (err) {
      if (err instanceof DuplicateCandidateError) {
        throw err;
      }
      throw new Error("Failed to create candidate");
    }
  }
}
