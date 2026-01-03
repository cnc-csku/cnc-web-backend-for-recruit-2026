import { Elysia, t } from "elysia";
import { CandidateService } from "./candidate.service";
import { CreateCandidateBody } from "./candidate.model";
import {
  CandidateNotFoundError,
  DomainError,
  DuplicateCandidateError,
  EditLimitExceededError,
} from "../../core/errors";
import { CreateInterViewQuestBody } from "../interviewQuestion/interviewQuestion.model";

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
    data: Partial<CreateCandidateBody>,
    isAdmin: boolean = false
  ) {
    try {
      return await this.service.updateCandidate(candidateId, data, isAdmin);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to update candidate");
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

  async deleteCandidate(id: string) {
    return await this.service.deleteById(id);
  }

  async getInterViewQuestions(id: string) {
    try {
      return await this.service.getInterViewQuestions(id);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to get question");
    }
  }

  async addInterViewQuestion(
    id: string,
    data: Omit<CreateInterViewQuestBody, "candidateId">
  ) {
    try {
      return await this.service.addInterViewQuestion(id, data);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to add question");
    }
  }

  async updateInterViewQuestion(
    candidateId: string,
    questionId: string,
    data: Omit<CreateInterViewQuestBody, "candidateId">
  ) {
    try {
      return await this.service.updateInterViewQuestion(
        candidateId,
        questionId,
        data
      );
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to update question");
    }
  }
  async deleteInterviewQuestion(questionId: string) {
    return await this.service.deleteInterViewQuestion(questionId);
  }
}
