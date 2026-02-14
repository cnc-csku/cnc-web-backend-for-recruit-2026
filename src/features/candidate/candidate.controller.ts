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
import {
  AddQuestionBody,
<<<<<<< HEAD
=======
  UpdateQuestionBody,
>>>>>>> release/v1.3
  AddReviewerBody,
  UpdateVoiceBody,
} from "../interviewQuestion/interviewQuestion.model";
import { AuditMeta } from "../auditLog/audit.model";
import { ClientSession } from "mongodb";

export class CandidateController {
  constructor(private service: CandidateService) {}

  async getCandidateByEmail(email: string, withS3: boolean) {
    return await this.service.findByEmail(email, withS3);
  }

  async getCandidate(id: string, session?: ClientSession) {
    return await this.service.findById(id, session);
  }

  async getAllCandidates() {
    return await this.service.getAlls();
  }

<<<<<<< HEAD
=======
  async submitCandidate() {}

>>>>>>> release/v1.3
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
    session?: ClientSession,
  ) {
    const candidate = await this.service.findByEmail(email, false);
    if (!candidate) {
      throw new CandidateNotFoundError();
    }
    return await this.updateCandidate(
      candidate._id.toString(),
      data,
      isAdmin,
      meta,
      session,
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
    email: string,
    data: CreateCandidateBody,
    meta: AuditMeta,
    session?: ClientSession,
  ) {
    try {
      return await this.service.createCandidate(email, data, meta, session);
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

  // ─────────────────────────────────────
  // Interview Questions
  // ─────────────────────────────────────

  async getInterViewQuestions(id: string) {
    try {
      return await this.service.getInterViewQuestions(id);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to get questions");
    }
  }

  async initInterViewQuestions(id: string, meta: AuditMeta) {
    try {
      return await this.service.initInterViewQuestions(id, meta);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to init interview document");
    }
  }

<<<<<<< HEAD
  async initInterViewQuestions(id: string, meta: AuditMeta) {
    try {
      return await this.service.initInterViewQuestions(id, meta);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to init questions");
    }
  }

  async addInterViewQuestion(id: string, data: AddQuestionBody, meta: AuditMeta) {
=======
  async addInterViewQuestion(
    id: string,
    data: AddQuestionBody,
    meta: AuditMeta,
  ) {
>>>>>>> release/v1.3
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
<<<<<<< HEAD
    room: "attitude" | "technical",
    questionIndex: number,
    data: { title?: string; answer?: string; score?: number },
=======
    room: "technical" | "attitude",
    index: number,
    data: UpdateQuestionBody,
>>>>>>> release/v1.3
    meta: AuditMeta,
  ) {
    try {
      return await this.service.updateInterViewQuestion(
        candidateId,
        room,
<<<<<<< HEAD
        questionIndex,
=======
        index,
>>>>>>> release/v1.3
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

  async deleteInterViewQuestion(
    candidateId: string,
<<<<<<< HEAD
    room: "attitude" | "technical",
    questionIndex: number,
    meta: AuditMeta,
  ) {
    return await this.service.deleteInterViewQuestion(
      candidateId,
      room,
      questionIndex,
      meta,
    );
  }

  async addInterViewReviewer(id: string, data: AddReviewerBody, meta: AuditMeta) {
    try {
      return await this.service.addInterViewReviewer(id, data, meta);
=======
    room: "technical" | "attitude",
    index: number,
    meta: AuditMeta,
  ) {
    try {
      return await this.service.deleteInterViewQuestion(
        candidateId,
        room,
        index,
        meta,
      );
>>>>>>> release/v1.3
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
<<<<<<< HEAD
      throw new Error("Failed to add reviewer");
    }
  }

  async updateInterViewVoice(id: string, data: UpdateVoiceBody, meta: AuditMeta) {
    try {
      return await this.service.updateInterViewVoice(id, data, meta);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to update voice");
=======
      throw new Error("Failed to delete question");
>>>>>>> release/v1.3
    }
  }

  // ─────────────────────────────────────
  // Reviewers
  // ─────────────────────────────────────

  async addInterViewReviewer(
    id: string,
    data: AddReviewerBody,
    meta: AuditMeta,
  ) {
    try {
      return await this.service.addInterViewReviewer(id, data, meta);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to add reviewer");
    }
  }

  // ─────────────────────────────────────
  // Audios / Voice
  // ─────────────────────────────────────

  async updateInterViewVoice(
    id: string,
    data: UpdateVoiceBody,
    meta: AuditMeta,
  ) {
    try {
      return await this.service.updateInterViewVoice(id, data, meta);
    } catch (err) {
      if (err instanceof DomainError) {
        throw err;
      }
      throw new Error("Failed to update voice");
    }
  }

  // ─────────────────────────────────────
  // Interview Slot
  // ─────────────────────────────────────

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

  async markWithdrawn(candidateId: string, session?: ClientSession) {
    return await this.service.markWithdrawn(candidateId);
  }
}
