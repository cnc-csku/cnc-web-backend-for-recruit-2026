import {
  type CreateCandidateBody,
  type Candidate,
  candidatesCol,
  CandidateInsert,
} from "./candidate.model";
import { db } from "../../core/db";
import {
  CandidateNotFoundError,
  DuplicateCandidateError,
  EditLimitExceededError,
} from "../../core/errors";
import { ObjectId } from "mongodb";

const MAX_EDIT_ALLOW = 2;

export class CandidateService {
  async getAlls() {
    return await candidatesCol.find({}).toArray();
  }

  async findByEmail(email: string) {
    return await candidatesCol.find({ email: email }).toArray();
  }

  async findById(id: string) {
    const _id = new ObjectId(id);
    return await candidatesCol.findOne({ _id });
  }

  async updateCandidate(
    candidateId: string,
    data: Partial<CreateCandidateBody>
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
          editCount: 1,
        },
      }
    );
    return result;
  }

  async createCandidate(data: CreateCandidateBody) {
    const exists = await this.findByEmail(data.email);
    if (exists.length !== 0) throw new DuplicateCandidateError();

    const candidate: CandidateInsert = {
      ...data,
      interviewQuestions: [],
      currentInterviewRoom: null,
      editCount: 0,
      createdAt: new Date(),
      updatedAt: null,
    };
    return await candidatesCol.insertOne(candidate);
  }
}
