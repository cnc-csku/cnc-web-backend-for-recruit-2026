import { t } from "elysia";
import { db } from "../../core/db";

export const FormModel = {
  form: t.Object({
    _id: t.Literal("FORM_CONFIG"),
    allowSubmit: t.Boolean(),
    opensAt: t.String({ format: "date-time" }),
    closesAt: t.String({ format: "date-time" }),
    editableUntil: t.String({ format: "date-time" }),
  }),
  scheduleBody: t.Object({
    opensAt: t.String({ format: "date-time" }),
    closesAt: t.String({ format: "date-time" }),
  }),
  allowSubmitBody: t.Object({
    allowSubmit: t.Boolean(),
  }),
  editableBody: t.Object({
    editableUntil: t.String({ format: "date-time" }),
  }),
};
export type Form = typeof FormModel.form.static;
export const formCol = (await db()).collection<Form>("form_config");
