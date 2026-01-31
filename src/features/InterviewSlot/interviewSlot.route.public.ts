import Elysia from "elysia";
import { interviewSlotController } from "../../lib/controllers";
import { interviewSlotOpenApi } from "./interviewSlot.openapi";

export const interviewSlotPublicRoute = new Elysia({ prefix: "/interview-slot" })
  .decorate("interviewSlotController", interviewSlotController)
  .get(
    "/",
    async ({ interviewSlotController }) => {
      return await interviewSlotController.getAllSlot(true);
    },
    { detail: interviewSlotOpenApi.getAllSlots },
  );
