import Elysia, { t } from "elysia";
import { interviewSlotController } from "../../lib/controllers";
import { auditPlugin } from "../auditLog/audit.plugin";
import { InterviewSlotModel } from "./InterviewSlot.model";

export const interviewSlotAdminRoute = new Elysia({ prefix: "/interview-slot" })
  .use(auditPlugin)
  .decorate("interviewSlotController", interviewSlotController)
  .post(
    "/",
    async ({ interviewSlotController, body }) => {
      return await interviewSlotController.createSlot(body);
    },
    {
      body: InterviewSlotModel.createSlotBody,
    }
  )
  .delete("/:slotId", async ({ interviewSlotController, body, params }) => {
    return await interviewSlotController.deleteSlot(params.slotId);
  });
