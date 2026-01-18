import { Elysia } from "elysia";
import { CandidateModel } from "./candidate.model";
import {
  candidateController,
  candidateUploadHandler,
  candidateWithdrawalService,
  interviewSlotController,
  storageController,
} from "../../lib/controllers";
import { ip } from "elysia-ip";
import { auditPlugin } from "../auditLog/audit.plugin";
import { candidateOpenApi } from "./candidate.openapi";
import { CandidateUploadHandler } from "./candidate.upload";

//TODO: get profile from auth
//TODO: Middleware rate limit

export const candidateRoute = new Elysia({ prefix: "/candidates" })
  .use(auditPlugin)
  .decorate("candidateController", candidateController)
  .decorate("interviewSlotController", interviewSlotController)
  .decorate("candidateWithdrawalService", candidateWithdrawalService)
  .decorate("candidateUploadHandler", candidateUploadHandler)
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
    async ({ body, candidateController, candidateUploadHandler, meta }) => {
      const result = await candidateController.createCandidate(body, meta);
      if (!result) return;

      const transcript = await candidateUploadHandler.profileUpload(
        body.transcriptFile,
        result.insertedId.toString(),
      );

      const profile = await candidateUploadHandler.profileUpload(
        body.profileImageFile,
        result.insertedId.toString(),
      );

      candidateController.updateUploadedFile(
        result.insertedId.toString(),
        profile.key,
        transcript.key,
      );

      return result.insertedId;
    },
    {
      body: CandidateModel.createCandidateBody,
      detail: candidateOpenApi.createCandidate,
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
