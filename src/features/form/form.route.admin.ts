import Elysia, { t } from "elysia";
import { FormModel } from "./form.model";
import { formController } from "../../lib/controllers";

export const formAdminRoute = new Elysia({ prefix: "/form" })
  .decorate("formController", formController)
  .put(
    "/schedule",
    async ({ formController, body }) => {
      return await formController.setFormSchedule(body.opensAt, body.closesAt);
    },
    { body: FormModel.scheduleBody }
  )
  .patch(
    "/set-allow-submit",
    async ({ formController, body,request }) => {
      return await formController.setAllowSubmit(body.allowSubmit);
    },
    {
      body: FormModel.allowSubmitBody,
    }
  );
