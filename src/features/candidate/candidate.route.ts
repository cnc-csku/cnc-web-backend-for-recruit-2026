import { Elysia } from "elysia";
import { CandidateModel } from "./candidate.model";
import {
  candidateController,
  candidateWithdrawalService,
  interviewSlotController,
} from "../../lib/controllers";
import { ip } from "elysia-ip";
import { auditPlugin } from "../auditLog/audit.plugin";

//TODO: get profile from auth
//TODO: Middleware rate limit

export const candidateRoute = new Elysia({ prefix: "/candidates" })
  .use(auditPlugin)
  .decorate("candidateController", candidateController)
  .decorate("interviewSlotController", interviewSlotController)
  .decorate("candidateWithdrawalService", candidateWithdrawalService)
  .get("/:candidateId", async ({ params, candidateController }) => {
    return await candidateController.getCandidate(params.candidateId);
  })
  .put(
    "/:id",
    async ({ params, body, candidateController, meta }) => {
      return await candidateController.updateCandidate(
        params.id,
        body,
        false,
        meta
      );
    },
    {
      body: CandidateModel.createCandidateBody,
    }
  )
  .post(
    "/submit",
    async ({ body, candidateController, meta }) => {
      return await candidateController.createCandidate(body, meta);
    },
    {
      body: CandidateModel.createCandidateBody,
    }
  )
  .delete("/:candidateId", async ({ params, meta }) => {
    return await candidateController.deleteCandidate(params.candidateId, meta);
  })
  .post(
    ":candidateId/withdraw",
    async ({ params, body, candidateWithdrawalService, meta }) => {
      return await candidateWithdrawalService.withdraw(
        params.candidateId,
        meta
      );
    }
  )

  //Interview Slot
  // Interview Slot - Assign candidate to a slot
  .post(
    ":candidateId/interview-slot",
    async ({ params, body, interviewSlotController, meta }) => {
      return await interviewSlotController.assignCandidateToSlot(
        params.candidateId,
        body.slotId,
        meta
      );
    },
    {
      body: CandidateModel.assignSlotBody,
    }
  )
  // Interview Slot - Change selected slot
  .patch(
    ":candidateId/interview-slot",
    async ({ params, body, interviewSlotController, meta }) => {
      return await interviewSlotController.changeCandidateAssignedSlot(
        params.candidateId,
        body.slotId,
        meta
      );
    },
    {
      body: CandidateModel.assignSlotBody,
    }
  )
  // Interview Slot - Unassign candidate from a slot
  .delete(
    ":candidateId/interview-slot",
    async ({ params, body, interviewSlotController, meta }) => {
      return await interviewSlotController.unAssignCandidateFromSlot(
        params.candidateId,
        body.slotId,
        meta
      );
    },
    {
      body: CandidateModel.unassignSlotBody,
    }
  );
