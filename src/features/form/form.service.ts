import {
  FormConfigError,
  SubmissionDisabledError,
  SubmissionWindowClosedError,
} from "../../core/errors";
import { Form, formCol } from "./form.model";

export class FormService {
  async getSchedule(): Promise<Omit<Form, "_id">> {
    const result = await formCol.findOne({ _id: "FORM_CONFIG" });
    if (!result) throw new Error("Schedule not found");

    return {
      allowSubmit: result.allowSubmit,
      opensAt: result.opensAt,
      closesAt: result.closesAt,
    };
  }

  async setAllowSubmit(isAllow: boolean) {
    return await formCol.updateOne(
      { _id: "FORM_CONFIG" },
      {
        $set: {
          allowSubmit: isAllow,
        },
      }
    );
  }

  async setFormSchedule(openTime: Date, closeTime: Date) {
    return await formCol.updateOne(
      { _id: "FORM_CONFIG" },
      {
        $set: {
          opensAt: openTime,
          closeSAt: closeTime,
        },
      }
    );
  }

  async assertSubmissionAllowed() {
    const config = await formCol.findOne({ _id: "FORM_CONFIG" });
    if (!config) throw new FormConfigError();
    if (!config.allowSubmit) throw new SubmissionDisabledError();
    const now = new Date();

    if (now < config.opensAt || now > config.closesAt) {
      throw new SubmissionWindowClosedError();
    }
  }
}
