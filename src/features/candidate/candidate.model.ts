import { t } from "elysia";
import { db } from "../../core/db";
import { type InterviewQuestion } from "../interviewQuestion/interviewQuestion.model";
import { WithId } from "mongodb";

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

export const TypeOfDPM = t.Union([t.Literal("NORMAL"), t.Literal("SPECIAL")]);

export const NisitYearParticipated = t.Union([
  t.Literal("83"),
  t.Literal("84"),
  t.Literal("85"),
]);

export const ApplicationStatus = t.Union([
  t.Literal("ACTIVE"),
  t.Literal("WITHDRAWN"),
]);

export const InterviewStatus = t.Union([
  t.Literal("PENDING"),
  t.Literal("SHORTLISTED"),
  t.Literal("INTERVIEWING"),
  t.Literal("INTERVIEWED"),
  t.Literal("PASSED"),
  t.Literal("FAILED"),
]);

export type InterviewStatusStatic = typeof InterviewStatus.static;

const CreateCandidateBodySchema = t.Object(
  {
    nisitId: t.String({ minLength: 10, maxLength: 10 }),
    firstName: t.String({ minLength: 1 }),
    lastName: t.String({ minLength: 1 }),
    nickName: t.String({ minLength: 1 }),
    bio: t.String(),
    typeOfDpm: TypeOfDPM,
    nisitYearParticipated: NisitYearParticipated,
    gradeGPAX: t
      .Transform(t.String())
      .Decode((val) => parseFloat(val))
      .Encode((val) => val.toFixed(2)),
    profileImage: t.File({ format: "image/*" }),
    transcript: t.File({ format: ["image/*", "application/pdf"] }),
    address: t.String(),
    mbti: t.String(),
    phoneNumber: t.String({ minLength: 9, maxLength: 10 }),
    socialContact: t.String(),
    github: t.String(),
    interviewSlotId: t.Optional(t.String()),
    referralSource: t.Union([
      ReferralSource,
      t.Array(ReferralSource),
    ]),
    projectExperience: t.String(),
    clubs: t.String(),
    interests: t.String(),
    hobbies: t.String(),
    whyCnc: t.String(),
    expected: t.String(),
    tools: t.String(),
  },
  { additionalProperties: false },
);

export const UpdateCandidateBodySchema = t.Intersect(
  [
    t.Partial(
      t.Omit(CreateCandidateBodySchema, ["profileImage", "transcript"]),
    ),
    t.Object({
      profileImageKey: t.Optional(t.Nullable(t.String())),
      transcriptKey: t.Optional(t.Nullable(t.String())),
    }),
  ],
  { additionalProperties: false },
);

export const CandidateModel = {
  candidate: t.Object({
    email: t.String({ minLength: 1 }),
    nisitId: t.String({ minLength: 10, maxLength: 10 }),
    firstName: t.String({ minLength: 1 }),
    lastName: t.String({ minLength: 1 }),
    nickName: t.String({ minLength: 1 }),
    bio: t.String(),
    typeOfDpm: TypeOfDPM,
    nisitYearParticipated: NisitYearParticipated,
    gradeGPAX: t.Number({
      minimum: 0,
      maximum: 4,
      multipleOf: 0.01,
    }),
    profileImageKey: t.Nullable(t.String()),
    transcriptKey: t.Nullable(t.String()),
    address: t.String(),
    mbti: t.String(),
    phoneNumber: t.String({ minLength: 9, maxLength: 10 }),

    socialContact: t.String(),
    github: t.String(),

    interviewSlotId: t.Optional(t.String()),

    //questions answer
    referralSource: t.Union([
      ReferralSource,
      t.Array(ReferralSource),
    ]),
    projectExperience: t.String(),
    clubs: t.String(),
    interests: t.String(),
    hobbies: t.String(),
    whyCnc: t.String(),
    expected: t.String(),
    tools: t.String(),

    currentInterviewRoom: t.Nullable(t.Array(InterviewRoom)),
    applicationStatus: ApplicationStatus,
    interviewStatus: InterviewStatus,
    editCount: t.Number(),
    createdAt: t.Date(),
    updatedAt: t.Nullable(t.Date()),
  }),

  createCandidateBody: CreateCandidateBodySchema,

  updateCandidateBody: UpdateCandidateBodySchema,
  assignSlotBody: t.Object({
    slotId: t.String({ minLength: 24, maxLength: 24 }),
  }),

  unassignSlotBody: t.Object({
    slotId: t.String({ minLength: 24, maxLength: 24 }),
  }),

  changeSlotBody: t.Object({
    newSlotId: t.String({ minLength: 24, maxLength: 24 }),
  }),
};

export type Candidate = typeof CandidateModel.candidate.static;
export type CandidateWithInterviewQuestions = WithId<Candidate> & {
  interviewQuestions: InterviewQuestion | null;
};

export type CreateCandidateBody =
  typeof CandidateModel.createCandidateBody.static;

export type UpdateCandidateBody =
  typeof CandidateModel.updateCandidateBody.static;

export const candidatesCol = (await db()).collection<Candidate>("candidates");
