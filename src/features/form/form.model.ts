import { t } from "elysia";
import { db } from "../../core/db";

export const FormModel = {
  form: t.Object({
    _id: t.Literal("FORM_CONFIG"),
    allowSubmit: t.Boolean(),
    opensAt: t.Date(),
    closesAt: t.Date(),
  }),
  scheduleBody: t.Object({
    opensAt: t.Date(),
    closesAt: t.Date(),
  }),
  allowSubmitBody: t.Object({
    allowSubmit: t.Boolean(),
  }),
};
export type Form = typeof FormModel.form.static;
export const formCol = (await db()).collection<Form>("form_config");
