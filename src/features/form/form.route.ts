import Elysia from "elysia";
import { FormModel } from "./form.model";
import { formController } from "../../lib/controllers";
import { auditPlugin } from "../auditLog/audit.plugin";
import { formOpenApi } from "./form.openapi";
import { requireRole } from "../auth/auth.guard";

// Public route - GET /form/schedule
export const formPublicRoute = new Elysia({ prefix: "/form" })
  .decorate("formController", formController)
  .get(
    "/schedule",
    async ({ formController }) => {
      return await formController.getSchedule();
    },
    { detail: formOpenApi.getFormSchedule },
  );

// Protected routes - all other /form/* endpoints
export const formRoute = new Elysia({ prefix: "/form" })
  .use(auditPlugin)
  .use(requireRole("Admin"))
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
  )
  .patch(
    "/set-countdown",
    async ({ formController, body, meta }) => {
      return await formController.setCountdownContext(
        body.countdownTitle,
        body.countdownTime,
        body.timeupMessage,
        body.recruitState,
        meta,
      );
    },
    {
      body: FormModel.countdownBody,
      detail: formOpenApi.setEditableUntil,
    },
  );
