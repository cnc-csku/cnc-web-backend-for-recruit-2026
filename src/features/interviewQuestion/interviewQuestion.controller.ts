import { AuditMeta } from "../auditLog/audit.model";
import { CreateInterViewQuestBody } from "./interviewQuestion.model";
import { InterviewQuestionService } from "./interviewQuestion.service";

export class InterviewQuestionController {
  constructor(private service: InterviewQuestionService) {}

  async getByCandidateId(candidateId: string) {
    return await this.service.getByCandidateId(candidateId);
  }

  async createInterViewQuestion(
    candidateId: string,
    data: Omit<CreateInterViewQuestBody, "candidateId">,
    meta: AuditMeta
  ) {
    return await this.service.createInterViewQuestion(candidateId, data, meta);
  }

  async updateInterViewQuestion(
    candidateId: string,
    data: Omit<CreateInterViewQuestBody, "candidateId">,
    meta: AuditMeta
  ) {
    return await this.service.updateInterViewQuestion(candidateId, data, meta);
  }

  async deleteQuestionById(questionId: string, meta: AuditMeta) {
    return await this.service.deleteById(questionId, meta);
  }
}
