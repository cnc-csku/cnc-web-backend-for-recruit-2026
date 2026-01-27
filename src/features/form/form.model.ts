import { t } from "elysia";
import { db } from "../../core/db";

export const FormModel = {
  form: t.Object({
    _id: t.Literal("FORM_CONFIG"),
    allowSubmit: t.Boolean(),
    opensAt: t.String({ format: "date-time" }),
    closesAt: t.String({ format: "date-time" }),
    editableUntil: t.String({ format: "date-time" }),
    countdownTitle: t.Nullable(t.String()),
    countdownTime: t.Nullable(t.String({ format: "date-time" })),
    timeupMessage: t.Nullable(t.String()),
    recruitState: t.Number({ default: 0 }),
  }),
  scheduleBody: t.Object({
    opensAt: t.String({ format: "date-time" }),
    closesAt: t.String({ format: "date-time" }),
  }),
  countdownBody: t.Object({
    countdownTitle: t.String(),
    countdownTime: t.String({ format: "date-time" }),
    timeupMessage: t.String(),
    recruitState: t.Number({ minimum: 0, maximum: 3, default: 0 }),
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
