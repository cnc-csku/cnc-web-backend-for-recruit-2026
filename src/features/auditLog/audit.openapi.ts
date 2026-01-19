import { OpenApiDetail } from "../../../shared/shared.model";

export const auditOpenApi: Record<string, OpenApiDetail> = {
  getAll: {
    operationId: "adminGetAudit",
    summary: "Get audit logs",
    description: "Retrieve paginated audit logs for admin review",
    tags: ["Audit"],
  },
};
