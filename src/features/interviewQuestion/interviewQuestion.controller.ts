import { AuditMeta } from "../auditLog/audit.model";
import {
  AddQuestionBody,
<<<<<<< HEAD
=======
  UpdateQuestionBody,
>>>>>>> release/v1.3
  AddReviewerBody,
  UpdateVoiceBody,
} from "./interviewQuestion.model";
import { InterviewQuestionService } from "./interviewQuestion.service";

export class InterviewQuestionController {
  constructor(private service: InterviewQuestionService) {}

  async getByCandidateId(candidateId: string) {
    return await this.service.getByCandidateId(candidateId);
  }

<<<<<<< HEAD
  async initForCandidate(candidateId: string, meta: AuditMeta) {
    return await this.service.initForCandidate(candidateId, meta);
  }

=======
  async initInterviewDocument(candidateId: string, meta: AuditMeta) {
    return await this.service.initInterviewDocument(candidateId, meta);
  }

  // ─── Questions ────────────────────────

>>>>>>> release/v1.3
  async addQuestion(
    candidateId: string,
    data: AddQuestionBody,
    meta: AuditMeta,
  ) {
    return await this.service.addQuestion(candidateId, data, meta);
  }

  async updateQuestion(
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
    return await this.service.updateQuestion(
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
  }

  async deleteQuestion(
    candidateId: string,
<<<<<<< HEAD
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

=======
    room: "technical" | "attitude",
    index: number,
    meta: AuditMeta,
  ) {
    return await this.service.deleteQuestion(candidateId, room, index, meta);
  }

  // ─── Reviewers ────────────────────────

>>>>>>> release/v1.3
  async addReviewer(
    candidateId: string,
    data: AddReviewerBody,
    meta: AuditMeta,
  ) {
    return await this.service.addReviewer(candidateId, data, meta);
  }

<<<<<<< HEAD
=======
  // ─── Audios / Voice ───────────────────

>>>>>>> release/v1.3
  async updateVoice(
    candidateId: string,
    data: UpdateVoiceBody,
    meta: AuditMeta,
  ) {
    return await this.service.updateVoice(candidateId, data, meta);
  }

<<<<<<< HEAD
  async deleteByCandidateId(candidateId: string, meta: AuditMeta) {
    return await this.service.deleteByCandidateId(candidateId, meta);
=======
  // ─── Delete ───────────────────────────

  async deleteById(candidateId: string, meta: AuditMeta) {
    return await this.service.deleteById(candidateId, meta);
>>>>>>> release/v1.3
  }
}
