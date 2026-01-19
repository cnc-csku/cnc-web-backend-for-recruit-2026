import { Elysia, t } from "elysia";
import { CandidateModel } from "./candidate.model";
import {
  candidateController,
  candidateWithdrawalService,
  interviewSlotController,
} from "../../lib/controllers";
import { ip } from "elysia-ip";
import { auditPlugin } from "../auditLog/audit.plugin";
import { candidateOpenApi } from "./candidate.openapi";

//TODO: get profile from auth
//TODO: Middleware rate limit

export const candidateRoute = new Elysia({ prefix: "/candidates" })
  .use(auditPlugin)
  .decorate("candidateController", candidateController)
  .decorate("interviewSlotController", interviewSlotController)
  .decorate("candidateWithdrawalService", candidateWithdrawalService)
  .get(
    "/:candidateId",
    async ({ params, candidateController }) => {
      return await candidateController.getCandidate(params.candidateId);
    },
    {
      detail: candidateOpenApi.getCandidate,
    },
  )
  .put(
    "/:id",
    async ({ params, body, candidateController, meta }) => {
      return await candidateController.updateCandidate(
        params.id,
        body,
        false,
        meta,
      );
    },
    {
      body: CandidateModel.createCandidateBody,
      detail: candidateOpenApi.updateCandidate,
    },
  )
  .post(
    "/submit",
    async ({ body, candidateController, meta, request }) => {
      // Debug: Log incoming request data
      console.log("=== /submit DEBUG ===");
      console.log("Content-Type:", request.headers.get("content-type"));
      console.log("Body keys:", Object.keys(body));
      console.log("Full body:", JSON.stringify(body, null, 2));

      const { profileImage, transcript, ...formData } = body;

      console.log("\nExtracted formData:", formData);
      console.log("\nprofileImage:", {
        name: profileImage?.name,
        type: profileImage?.type,
        size: profileImage?.size,
      });
      console.log("\ntranscript:", {
        name: transcript?.name,
        type: transcript?.type,
        size: transcript?.size,
      });
      console.log("=== END DEBUG ===\n");

      return await candidateController.createCandidateWithFiles(
        formData as any,
        profileImage,
        transcript,
        meta
      );
    },
    {
      body: t.Object({
        // Form fields
        email: t.String({ minLength: 1 }),
        nisitId: t.String({ minLength: 10, maxLength: 10 }),
        firstName: t.String({ minLength: 1 }),
        lastName: t.String({ minLength: 1 }),
        nickName: t.String({ minLength: 1 }),
        bio: t.String(),
        typeOfDpm: CandidateModel.TypeOfDPM,
        nisitYearParticipated: CandidateModel.NisitYearParticipatedString,
        gradeGPAX: t.String(),
        address: t.String(),
        mbti: t.String(),
        phoneNumber: t.String({ minLength: 9, maxLength: 10 }),
        socialContact: t.String(),
        github: t.String(),
        interviewSlotId: t.Optional(t.String()),
        referralSource: CandidateModel.ReferralSource,
        projectExperience: t.String(),
        clubs: t.String(),
        interests: t.String(),
        hobbies: t.String(),
        whyCnc: t.String(),
        expected: t.String(),
        tools: t.String(),

        // File fields
        profileImage: t.File(),
        transcript: t.File(),
      }),
      detail: {
        ...candidateOpenApi.createCandidate,
        description: "Submit candidate application with profile image and transcript files",
      },
    },
  )
  .delete(
    "/:candidateId",
    async ({ params, meta }) => {
      return await candidateController.deleteCandidate(
        params.candidateId,
        meta,
      );
    },
    { detail: candidateOpenApi.deleteCandidate },
  )
  .post(
    "/:candidateId/withdraw",
    async ({ params, body, candidateWithdrawalService, meta }) => {
      return await candidateWithdrawalService.withdraw(
        params.candidateId,
        meta,
      );
    },
    { detail: candidateOpenApi.withdrawCandidate },
  )

  //Interview Slot
  // Interview Slot - Assign candidate to a slot
  .post(
    "/:candidateId/interview-slot",
    async ({ params, body, interviewSlotController, meta }) => {
      return await interviewSlotController.assignCandidateToSlot(
        params.candidateId,
        body.slotId,
        meta,
      );
    },
    {
      body: CandidateModel.assignSlotBody,
      detail: candidateOpenApi.assignInterviewSlot,
    },
  )
  // Interview Slot - Change selected slot
  .patch(
    "/:candidateId/interview-slot",
    async ({ params, body, interviewSlotController, meta }) => {
      return await interviewSlotController.changeCandidateAssignedSlot(
        params.candidateId,
        body.slotId,
        meta,
      );
    },
    {
      body: CandidateModel.assignSlotBody,
      detail: candidateOpenApi.changeInterviewSlot,
    },
  )
  // Interview Slot - Unassign candidate from a slot
  .delete(
    "/:candidateId/interview-slot",
    async ({ params, body, interviewSlotController, meta }) => {
      return await interviewSlotController.unAssignCandidateFromSlot(
        params.candidateId,
        body.slotId,
        meta,
      );
    },
    {
      body: CandidateModel.unassignSlotBody,
      detail: candidateOpenApi.unassignInterviewSlot,
    },
  );
