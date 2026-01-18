import Elysia, { t } from "elysia";
import { interviewSlotController } from "../../lib/controllers";
import { auditPlugin } from "../auditLog/audit.plugin";
import { InterviewSlotModel } from "./interviewSlot.model";
import { interviewSlotOpenApi } from "./interviewSlot.openapi";

export const interviewSlotAdminRoute = new Elysia({ prefix: "/interview-slot" })
  .use(auditPlugin)
  .decorate("interviewSlotController", interviewSlotController)
  .get(
    "/",
    async ({ interviewSlotController, }) => {
      return await interviewSlotController.getAllSlot(true);
    },
    { detail: interviewSlotOpenApi.getAllSlots },
  )
  .post(
    "/",
    async ({ interviewSlotController, body, meta }) => {
      return await interviewSlotController.createSlot(body, meta);
    },
    {
      body: InterviewSlotModel.createSlotBody,
      detail: interviewSlotOpenApi.createSlot,
    },
  )
  .delete(
    "/:slotId",
    async ({ interviewSlotController, params, meta }) => {
      return await interviewSlotController.deleteSlot(params.slotId, meta);
    },
    { detail: interviewSlotOpenApi.deleteSlot },
  );
