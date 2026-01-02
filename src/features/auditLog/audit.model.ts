import { t } from "elysia";
import { db } from "../../core/db";
import { type InterViewQuestion } from "../interviewQuestion/interviewQuestion.model";

export const AuditLogModel = {
  auditLog: t.Object({
    actor: t.Object({}),
    
  }),
};

export type Candidate = typeof CandidateModel.candidate.static;
export type CandidateWithInterviewQuestions = Candidate & {
  interviewQuestions: InterViewQuestion[];
};

export type CreateCandidateBody =
  typeof CandidateModel.createCandidateBody.static;

export const candidatesCol = (await db()).collection<Candidate>("candidates");
