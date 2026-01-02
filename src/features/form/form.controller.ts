import { Form } from "./form.model";
import { FormService } from "./form.service";

export class FormController {
  constructor(private service: FormService) {}

  async getSchedule() {
    return await this.service.getSchedule();
  }

  async setAllowSubmit(isAllow: boolean) {
    return await this.service.setAllowSubmit(isAllow);
  }

  async setFormSchedule(openTime: Date, closeTime: Date) {
    return await this.service.setFormSchedule(openTime, closeTime);
  }

  async assertSubmissionAllowed() {
    await this.service.assertSubmissionAllowed();
  }
}
