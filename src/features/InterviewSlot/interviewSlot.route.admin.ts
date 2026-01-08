import Elysia, { t } from "elysia";
import { interviewSlotController } from "../../lib/controllers";
import { auditPlugin } from "../auditLog/audit.plugin";
import { InterviewSlotModel } from "./InterviewSlot.model";

export const interviewSlotAdminRoute = new Elysia({ prefix: "/interview-slot" })
  .use(auditPlugin)
  .decorate("interviewSlotController", interviewSlotController)
  .get("/", async ({ interviewSlotController, ip }) => {
    return await interviewSlotController.getAllSlot(true);
  })
  .post(
    "/",
    async ({ interviewSlotController, body, meta }) => {
      return await interviewSlotController.createSlot(body, meta);
    },
    {
      body: InterviewSlotModel.createSlotBody,
    }
  )
  .delete("/:slotId", async ({ interviewSlotController, params, meta }) => {
    return await interviewSlotController.deleteSlot(params.slotId, meta);
  });
