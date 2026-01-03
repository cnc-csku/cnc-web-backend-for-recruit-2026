import { AuditMeta } from "../auditLog/audit.model";
import { Form } from "./form.model";
import { FormService } from "./form.service";

export class FormController {
  constructor(private service: FormService) {}

  async getSchedule() {
    return await this.service.getSchedule();
  }

  async setAllowSubmit(isAllow: boolean, meta: AuditMeta) {
    return await this.service.setAllowSubmit(isAllow, meta);
  }

  async setFormSchedule(openTime: Date, closeTime: Date, meta: AuditMeta) {
    return await this.service.setFormSchedule(openTime, closeTime, meta);
  }

  async assertSubmissionAllowed() {
    await this.service.assertSubmissionAllowed();
  }
}
