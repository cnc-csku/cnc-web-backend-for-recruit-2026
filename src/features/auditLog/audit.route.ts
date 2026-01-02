import Elysia from "elysia";
import { auditLogController } from "../../lib/controllers";

export const auditLogRoute = new Elysia({ prefix: "/audit" })
  .decorate("auditLogController", auditLogController)
  .get("/", async ({ auditLogController }) => {
    return await auditLogController.getAllAuditLog();
  });
