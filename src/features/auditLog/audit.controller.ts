import {
  PaginationParams,
  PaginationResponse,
} from "../../../shared/shared.model";
import { AuditLog } from "./audit.model";
import { AuditLogService } from "./audit.service";

export class AuditLogController {
  constructor(private service: AuditLogService) {}

  async audit(data: Omit<AuditLog, "createdAt">) {
    try {
      await this.service.createAuditLog(data);
    } catch (err) {
      console.error("[AUDIT_FAILED]", {
        action: data.action,
        target: data.target,
        error: err,
      });
    }
  }

  async getAllAuditLog(query: PaginationParams) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { data, total } = await this.service.getAll(query);
    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
