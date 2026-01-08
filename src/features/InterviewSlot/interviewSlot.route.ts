import Elysia, { t } from "elysia";
import { interviewSlotController } from "../../lib/controllers";
import { auditPlugin } from "../auditLog/audit.plugin";
import { ip } from "elysia-ip";

export const interviewSlotRoute = new Elysia({ prefix: "/interview-slot" })
  .use(auditPlugin)
  .decorate("interviewSlotController", interviewSlotController)
  .get("/", async ({ interviewSlotController, ip }) => {
    return await interviewSlotController.getAllSlot();
  })
  .post(
    "/:slotId/candidates/:candidateId",
    async ({ interviewSlotController, body, params, meta }) => {
      return await interviewSlotController.addCandidateToSlot(
        params.candidateId,
        params.slotId,
        meta
      );
    }
  )
  .delete(
    "/:slotId/candidates/:candidateId",
    async ({ interviewSlotController, body, params, meta }) => {
      return await interviewSlotController.removeCandidateFromSlot(
        params.candidateId,
        params.slotId,
        meta
      );
    }
  );
