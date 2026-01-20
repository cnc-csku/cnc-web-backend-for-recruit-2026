import { Elysia, t } from "elysia";
import { CandidateService } from "./candidate.service";
import {
  CreateCandidateBody,
  InterviewStatusStatic,
  UpdateCandidateBody,
} from "./candidate.model";
import {
  CandidateNotFoundError,
  DomainError,
  DuplicateCandidateError,
  EditLimitExceededError,
} from "../../core/errors";
import { CreateInterViewQuestBody } from "../interviewQuestion/interviewQuestion.model";
import { AuditMeta } from "../auditLog/audit.model";
import { ClientSession } from "mongodb";

export class CandidateController {
  constructor(private service: CandidateService) {}

  async getCandidateByEmail(email: string) {
    return await this.service.findByEmail(email);
  }

  async getCandidateByEmail(email: string) {
    return await this.service.findByEmail(email);
  }

  async getCandidate(id: string, session?: ClientSession) {
    return await this.service.findById(id, session);
  }

  async getAllCandidates() {
    return await this.service.getAlls();
  }

  async updateCandidate(
    candidateId: string,
    data: Partial<UpdateCandidateBody>,
    isAdmin: boolean = false,
    meta: AuditMeta,
    session?: ClientSession,
  ) {
    try {
      return await this.service.updateCandidate(
        candidateId,
        data,
        isAdmin,
        meta,
        session,
      );
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to update candidate");
    }
  }

  async updateCandidateByEmail(
    email: string,
    data: Partial<UpdateCandidateBody>,
    isAdmin: boolean = false,
    meta: AuditMeta,
    session?: ClientSession
  ) {
    const candidate = await this.service.findByEmail(email);
    if (!candidate) {
      throw new CandidateNotFoundError();
    }
    return await this.updateCandidate(
      candidate._id.toString(),
      data,
      isAdmin,
      meta,
      session
    );
  }

  async updateCandidateInterviewStatus(
    candidateId: string,
    status: InterviewStatusStatic,
    meta: AuditMeta,
  ) {
    try {
      return await this.service.updateInterviewStatus(
        candidateId,
        status,
        meta,
      );
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to update candidate");
    }
  }

  async createCandidate(
    data: CreateCandidateBody,
    meta: AuditMeta,
    session?: ClientSession,
  ) {
    try {
      return await this.service.createCandidate(data, meta, session);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to create candidate");
    }
  }

  async deleteCandidate(id: string, meta: AuditMeta) {
    return await this.service.deleteById(id, meta);
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
    data: Omit<CreateInterViewQuestBody, "candidateId">,
    meta: AuditMeta,
  ) {
    try {
      return await this.service.addInterViewQuestion(id, data, meta);
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
    data: Omit<CreateInterViewQuestBody, "candidateId">,
    meta: AuditMeta,
  ) {
    try {
      return await this.service.updateInterViewQuestion(
        candidateId,
        questionId,
        data,
        meta,
      );
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to update question");
    }
  }

  async deleteInterviewQuestion(questionId: string, meta: AuditMeta) {
    return await this.service.deleteInterViewQuestion(questionId, meta);
  }

  async assignInterviewSlot(
    candidateId: string,
    slotId: string,
    session?: ClientSession,
  ) {
    return await this.service.assignInterviewSlot(candidateId, slotId, session);
  }

  async unAssignInterviewSlot(candidateId: string, session?: ClientSession) {
    return await this.service.unAssignInterviewSlot(candidateId, session);
  }

  // set status to withDraw and unbind from account
  async markWithdrawn(candidateId: string, session?: ClientSession) {
    return await this.service.markWithdrawn(candidateId);
  }
}
