import Elysia from "elysia";
import { formController } from "../../lib/controllers";

export const formRoute = new Elysia({ prefix: "/form" })
  .decorate("formController", formController)
  .get("/schedule", async ({ formController }) => {
    return await formController.getSchedule();
  });
