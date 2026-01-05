import Elysia, { t } from "elysia";
import { interviewSlotController } from "../../lib/controllers";
import { auditPlugin } from "../auditLog/audit.plugin";
import { InterviewSlotModel } from "./InterviewSlot.model";

export const interviewSlotRoute = new Elysia({ prefix: "/interview-slot" })
  .use(auditPlugin)
  .decorate("interviewSlotController", interviewSlotController)
  .get("/", async ({ interviewSlotController, body, meta }) => {
    return await interviewSlotController.getAllSlot();
  })
  .post(
    "/:slotId/candidates/:candidateId",
    async ({ interviewSlotController, body, params }) => {
      return await interviewSlotController.addCandidateToSlot(
        params.candidateId,
        params.slotId
      );
    }
  )
  .delete(
    "/:slotId/candidates/:candidateId",
    async ({ interviewSlotController, body, params }) => {
      return await interviewSlotController.removeCandidateFromSlot(
        params.candidateId,
        params.slotId
      );
    }
  );
