import { AuditLog, auditLogsCol } from "./audit.model";

export class AuditLogService {
  async createAuditLog(data: Omit<AuditLog, "createdAt">) {
    const log: AuditLog = {
      ...data,
      createdAt: new Date(),
    };
    await auditLogsCol.insertOne(log);
  }

  async getAll() {
    return await auditLogsCol.find({}).toArray();
  }
}
