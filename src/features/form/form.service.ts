import {
  FormConfigError,
  ScheduleNotFoundError,
  SubmissionDisabledError,
  SubmissionWindowClosedError,
} from "../../core/errors";
import { AuditLogController } from "../auditLog/audit.controller";
import { AuditMeta } from "../auditLog/audit.model";
import { AuditUtils } from "../auditLog/audit.utils";
import { Form, formCol } from "./form.model";

export class FormService {
  constructor(private auditController: AuditLogController) {}
  async getSchedule(): Promise<Omit<Form, "_id">> {
    const result = await formCol.findOne({ _id: "FORM_CONFIG" });
    if (!result) throw new ScheduleNotFoundError();

    return {
      allowSubmit: result.allowSubmit,
      opensAt: result.opensAt,
      closesAt: result.closesAt,
    };
  }

  async setAllowSubmit(isAllow: boolean, meta: AuditMeta) {
    const before = await formCol.findOne({ _id: "FORM_CONFIG" });
    if (!before) throw new ScheduleNotFoundError();

    const result = await formCol.findOneAndUpdate(
      { _id: "FORM_CONFIG" },
      {
        $set: {
          allowSubmit: isAllow,
        },
      },
      { returnDocument: "after" }
    );
    if (!result) throw new ScheduleNotFoundError();

    const changes = AuditUtils.calculateDiff(before, result);
    this.auditController.audit({
      ...meta,
      action: "SET_FORM_ALLOW_SUBMIT",
      changes: {
        before: changes.before,
        after: changes.after,
      },
      target: {
        type: "FORM",
        id: result._id.toString(),
      },
    });
    return result;
  }

  async setFormSchedule(openTime: Date, closeTime: Date, meta: AuditMeta) {
    const before = await formCol.findOne({ _id: "FORM_CONFIG" });
    if (!before) throw new ScheduleNotFoundError();

    const result = await formCol.findOneAndUpdate(
      { _id: "FORM_CONFIG" },
      {
        $set: {
          opensAt: openTime,
          closesAt: closeTime,
        },
      },
      { returnDocument: "after" }
    );

    if (!result) throw new ScheduleNotFoundError();

    const changes = AuditUtils.calculateDiff(before, result);
    this.auditController.audit({
      ...meta,
      action: "UPDATE_FORM_SCHEDULE",
      changes: {
        before: changes.before,
        after: changes.after,
      },
      target: {
        type: "FORM",
        id: result._id.toString(),
      },
    });
    return result;
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
