import { CreateInterViewQuestBody } from "./interviewQuestion.model";
import { InterviewQuestionService } from "./interviewQuestion.service";

export class InterviewQuestionController {
  constructor(private service: InterviewQuestionService) {}

  async getByCandidateId(candidateId: string) {
    return await this.service.getByCandidateId(candidateId);
  }

  async createInterViewQuestion(
    candidateId: string,
    data: Omit<CreateInterViewQuestBody, "candidateId">
  ) {
    return await this.service.createInterViewQuestion(candidateId, data);
  }

  async updateInterViewQuestion(
    candidateId: string,
    data: Omit<CreateInterViewQuestBody, "candidateId">
  ) {
    return await this.service.updateInterViewQuestion(candidateId, data);
  }

  async deleteQuestionById(questionId: string) {
    return await this.service.deleteById(questionId);
  }
}
