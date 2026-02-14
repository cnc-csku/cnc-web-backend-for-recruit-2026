import { AuditMeta } from "../auditLog/audit.model";
import {
  AddQuestionBody,
  UpdateQuestionBody,
  AddReviewerBody,
  UpdateVoiceBody,
} from "./interviewQuestion.model";
import { InterviewQuestionService } from "./interviewQuestion.service";

export class InterviewQuestionController {
  constructor(private service: InterviewQuestionService) {}

  async getByCandidateId(candidateId: string) {
    return await this.service.getByCandidateId(candidateId);
  }

  async initInterviewDocument(candidateId: string, meta: AuditMeta) {
    return await this.service.initInterviewDocument(candidateId, meta);
  }

  // ─── Questions ────────────────────────

  async addQuestion(
    candidateId: string,
    data: AddQuestionBody,
    meta: AuditMeta,
  ) {
    return await this.service.addQuestion(candidateId, data, meta);
  }

  async updateQuestion(
    candidateId: string,
    room: "technical" | "attitude",
    index: number,
    data: UpdateQuestionBody,
    meta: AuditMeta,
  ) {
    return await this.service.updateQuestion(
      candidateId,
      room,
      index,
      data,
      meta,
    );
  }

  async deleteQuestion(
    candidateId: string,
    room: "technical" | "attitude",
    index: number,
    meta: AuditMeta,
  ) {
    return await this.service.deleteQuestion(candidateId, room, index, meta);
  }

  // ─── Reviewers ────────────────────────

  async addReviewer(
    candidateId: string,
    data: AddReviewerBody,
    meta: AuditMeta,
  ) {
    return await this.service.addReviewer(candidateId, data, meta);
  }

  // ─── Audios / Voice ───────────────────

  async updateVoice(
    candidateId: string,
    data: UpdateVoiceBody,
    meta: AuditMeta,
  ) {
    return await this.service.updateVoice(candidateId, data, meta);
  }

  // ─── Delete ───────────────────────────

  async deleteById(candidateId: string, meta: AuditMeta) {
    return await this.service.deleteById(candidateId, meta);
  }
}
