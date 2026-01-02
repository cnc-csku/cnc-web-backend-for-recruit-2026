import {
  type CreateCandidateBody,
  type Candidate,
  candidatesCol,
  CandidateWithInterviewQuestions,
} from "./candidate.model";
import { db } from "../../core/db";
import {
  CandidateNotFoundError,
  DuplicateCandidateError,
  EditLimitExceededError,
} from "../../core/errors";
import { ObjectId } from "mongodb";
import { CreateInterViewQuestBody } from "../interviewQuestion/interviewQuestion.model";
import { InterviewQuestionController } from "../interviewQuestion/interviewQuestion.controller";
import { FormController } from "../form/form.controller";

const MAX_EDIT_ALLOW = 2;

export class CandidateService {
  constructor(
    private interviewQuestionController: InterviewQuestionController,
    private formController: FormController
  ) {}

  async getAlls(): Promise<Candidate[]> {
    return await candidatesCol.find({}).toArray();
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    return await candidatesCol.findOne({ email: email });
  }

  //only include interviewquestion when lookup by id
  async findById(id: string): Promise<CandidateWithInterviewQuestions> {
    const _id = new ObjectId(id);
    const candidate = await candidatesCol.findOne({ _id });
    if (!candidate) throw new CandidateNotFoundError();

    const interviewQ = await this.interviewQuestionController.getByCandidateId(
      id
    );
    return { ...candidate, interviewQuestions: interviewQ };
  }

  async updateCandidate(
    candidateId: string,
    data: Partial<CreateCandidateBody>,
    isAdmin: boolean = false
  ) {
    const exist = await this.findById(candidateId);
    if (!exist) throw new CandidateNotFoundError();
    if (exist.editCount >= MAX_EDIT_ALLOW) throw new EditLimitExceededError();

    const _id = new ObjectId(candidateId);
    const result = await candidatesCol.updateOne(
      { _id },
      {
        $set: { ...data, updatedAt: new Date() },
        $inc: {
          editCount: isAdmin ? 0 : 1,
        },
      }
    );
    return result;
  }

  async createCandidate(data: CreateCandidateBody) {
    await this.formController.assertSubmissionAllowed();

    const exist = await this.findByEmail(data.email);
    if (exist) throw new DuplicateCandidateError();

    const candidate: Candidate = {
      ...data,
      currentInterviewRoom: null,
      editCount: 0,
      createdAt: new Date(),
      updatedAt: null,
    };
    return await candidatesCol.insertOne(candidate);
  }

  async deleteById(id: string) {
    const _id = new ObjectId(id);
    return await candidatesCol.deleteOne({ _id });
  }

  async getInterViewQuestions(id: string) {
    const exist = await this.findById(id);
    if (!exist) throw new CandidateNotFoundError();

    return await this.interviewQuestionController.getByCandidateId(id);
  }

  async addInterViewQuestion(
    id: string,
    data: Omit<CreateInterViewQuestBody, "candidateId">
  ) {
    const exist = await this.findById(id);
    if (!exist) throw new CandidateNotFoundError();

    return await this.interviewQuestionController.createInterViewQuestion(
      id,
      data
    );
  }

  async updateInterViewQuestion(
    candidateId: string,
    questionid: string,
    data: Omit<CreateInterViewQuestBody, "candidateId">
  ) {
    const exist = await this.findById(candidateId);
    if (!exist) throw new CandidateNotFoundError();

    return await this.interviewQuestionController.updateInterViewQuestion(
      questionid,
      data
    );
  }

  async deleteInterViewQuestion(questionId: string) {
    return await this.interviewQuestionController.deleteQuestionById(
      questionId
    );
  }
}
