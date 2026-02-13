import { AuditMeta } from "../auditLog/audit.model";
import {
  AddQuestionBody,
  AddReviewerBody,
  UpdateVoiceBody,
} from "./interviewQuestion.model";
import { InterviewQuestionService } from "./interviewQuestion.service";

export class InterviewQuestionController {
  constructor(private service: InterviewQuestionService) {}

  async getByCandidateId(candidateId: string) {
    return await this.service.getByCandidateId(candidateId);
  }

  async initForCandidate(candidateId: string, meta: AuditMeta) {
    return await this.service.initForCandidate(candidateId, meta);
  }

  async addQuestion(
    candidateId: string,
    data: AddQuestionBody,
    meta: AuditMeta,
  ) {
    return await this.service.addQuestion(candidateId, data, meta);
  }

  async updateQuestion(
    candidateId: string,
    room: "attitude" | "technical",
    questionIndex: number,
    data: { title?: string; answer?: string; score?: number },
    meta: AuditMeta,
  ) {
    return await this.service.updateQuestion(
      candidateId,
      room,
      questionIndex,
      data,
      meta,
    );
  }

  async deleteQuestion(
    candidateId: string,
    room: "attitude" | "technical",
    questionIndex: number,
    meta: AuditMeta,
  ) {
    return await this.service.deleteQuestion(
      candidateId,
      room,
      questionIndex,
      meta,
    );
  }

  async addReviewer(
    candidateId: string,
    data: AddReviewerBody,
    meta: AuditMeta,
  ) {
    return await this.service.addReviewer(candidateId, data, meta);
  }

  async updateVoice(
    candidateId: string,
    data: UpdateVoiceBody,
    meta: AuditMeta,
  ) {
    return await this.service.updateVoice(candidateId, data, meta);
  }

  async deleteByCandidateId(candidateId: string, meta: AuditMeta) {
    return await this.service.deleteByCandidateId(candidateId, meta);
  }
}
