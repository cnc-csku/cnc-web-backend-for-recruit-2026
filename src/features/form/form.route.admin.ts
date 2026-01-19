import Elysia from "elysia";
import { FormModel } from "./form.model";
import { formController } from "../../lib/controllers";
import { auditPlugin } from "../auditLog/audit.plugin";
import { formOpenApi } from "./form.openapi";

export const formAdminRoute = new Elysia({ prefix: "/form" })
  .use(auditPlugin)
  .decorate("formController", formController)
  .put(
    "/schedule",
    async ({ formController, body, meta }) => {
      return await formController.setFormSchedule(
        body.opensAt,
        body.closesAt,
        meta,
      );
    },
    { body: FormModel.scheduleBody, detail: formOpenApi.setFormSchedule },
  )
  .patch(
    "/set-allow-submit",
    async ({ formController, body, meta }) => {
      return await formController.setAllowSubmit(body.allowSubmit, meta);
    },
    {
      body: FormModel.allowSubmitBody,
      detail: formOpenApi.setAllowSubmit,
    },
  )
  .patch(
    "/set-editable",
    async ({ formController, body, meta }) => {
      return await formController.setEditableUntil(body.editableUntil, meta);
    },
    {
      body: FormModel.editableBody,
      detail: formOpenApi.setEditableUntil,
    },
  );
