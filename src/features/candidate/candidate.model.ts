import { t } from "elysia";
import { db } from "../../core/db";
import { WithId } from "mongodb";
import {
  InterviewQuestionModel,
  type InterViewQuestion,
} from "../interviewQuestion/interviewQuestion.model";

export const ReferralSource = t.Union([
  t.Literal("SENIOR"),
  t.Literal("FRIEND"),
  t.Literal("LECTURER"),
  t.Literal("OTHER"),
]);

export const InterviewRoom = t.Union([
  t.Literal("ATTITUDE"),
  t.Literal("TECHNICAL"),
]);

export const CandidateModel = {
  candidate: t.Object({
    fullName: t.String(),
    yearOfStudy: t.Number(),
    email: t.String(),
    province: t.String(),
    bio: t.String(),
    profileImagePath: t.String(),
    projectExperience: t.String(),
    referralSource: ReferralSource,
    reasonForJoining: t.String(),
    question1: t.String(),
    question2: t.String(),
    question3: t.String(),
    question4: t.String(),
    question5: t.String(),
    currentInterviewRoom: t.Nullable(InterviewRoom),
    editCount: t.Number(),
    createdAt: t.Date(),
    updatedAt: t.Nullable(t.Date()),
  }),

  createCandidateBody: t.Object({
    fullName: t.String(),
    yearOfStudy: t.Number(),
    email: t.String(),
    province: t.String(),
    bio: t.String(),
    profileImagePath: t.String(),
    projectExperience: t.String(),
    referralSource: ReferralSource,
    reasonForJoining: t.String(),
    question1: t.String(),
    question2: t.String(),
    question3: t.String(),
    question4: t.String(),
    question5: t.String(),
  }),
};

export type Candidate = typeof CandidateModel.candidate.static;
export type CandidateWithInterviewQuestions = Candidate & {
  interviewQuestions: InterViewQuestion[];
};

export type CreateCandidateBody =
  typeof CandidateModel.createCandidateBody.static;

export const candidatesCol = (await db()).collection<Candidate>("candidates");
