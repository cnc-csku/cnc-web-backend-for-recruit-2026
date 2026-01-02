import { AuditLog } from "./audit.model";
import { AuditLogService } from "./audit.service";

export class AuditLogController {
  constructor(private service: AuditLogService) {}

  async createAuditLog(data: Omit<AuditLog, "createdAt">) {
    await this.service.createAuditLog(data);
  }

  async getAllAuditLog() {
    return await this.service.getAll();
  }
}
