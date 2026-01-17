import { formCol } from "../features/form/form.model";
import { db } from "./db";

export async function bootstrapFormConfig() {
  await formCol.updateOne(
    { _id: "FORM_CONFIG" },
    {
      $setOnInsert: {
        _id: "FORM_CONFIG",
        allowSubmit: false,
        opensAt: new Date("2099-01-01T00:00:00Z").toISOString(),
        closesAt: new Date("2099-01-02T00:00:00Z").toISOString(),
        editableUntil: new Date("2099-01-02T00:00:00Z").toISOString(),
        createdAt: new Date().toISOString(),
      },
    },
    { upsert: true },
  );
}
