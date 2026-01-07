import Elysia from "elysia";
import { FormModel } from "./form.model";
import { formController } from "../../lib/controllers";
import { auditPlugin } from "../auditLog/audit.plugin";

export const formAdminRoute = new Elysia({ prefix: "/form" })
  .use(auditPlugin)
  .decorate("formController", formController)
  .put(
    "/schedule",
    async ({ formController, body, meta }) => {
      return await formController.setFormSchedule(
        body.opensAt,
        body.closesAt,
        meta
      );
    },
    { body: FormModel.scheduleBody }
  )
  .patch(
    "/set-allow-submit",
    async ({ formController, body, meta }) => {
      return await formController.setAllowSubmit(body.allowSubmit, meta);
    },
    {
      body: FormModel.allowSubmitBody,
    }
  );
