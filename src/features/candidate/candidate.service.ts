import {
  type CreateCandidateBody,
  type Candidate,
  candidatesCol,
  CandidateInsert,
} from "./candidate.model";
import { db } from "../../core/db";
import { DuplicateCandidateError } from "../../core/errors";

export class CandidateService {
  async getAlls() {
    return await candidatesCol.find({}).toArray();
  }

  async findByEmail(email: string) {
    return await candidatesCol.find({ email: email }).toArray();
  }

  async createCandidate(data: CreateCandidateBody) {
    const exists = await this.findByEmail(data.email);
    if (exists.length !== 0) throw new DuplicateCandidateError();

    const candidate: CandidateInsert = {
      ...data,
      interviewQuestions: [],
      currentInterviewRoom: null,
      edited: 0,
      createdAt: new Date(),
    };
    return await candidatesCol.insertOne(candidate);
  }
}
