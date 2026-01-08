import { PaginationParams } from "../../../shared/shared.model";
import { AuditLog, auditLogsCol } from "./audit.model";

export class AuditLogService {
  async createAuditLog(data: Omit<AuditLog, "createdAt">) {
    const log: AuditLog = {
      ...data,
      createdAt: new Date(),
    };
    await auditLogsCol.insertOne(log);
  }

  async getAll({ page = 1, limit = 15 }: PaginationParams) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      auditLogsCol.find({}).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      auditLogsCol.countDocuments(),
    ]);
    return { data, total };
  }
}
