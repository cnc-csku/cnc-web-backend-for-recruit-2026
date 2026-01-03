import Elysia from "elysia";
import { auditLogController } from "../../lib/controllers";
import { PaginationModal } from "../../../shared/shared.model";

export const auditLogRoute = new Elysia({ prefix: "/audit" })
  .decorate("auditLogController", auditLogController)
  .get(
    "/",
    async ({ auditLogController, query }) => {
      return await auditLogController.getAllAuditLog(query);
    },
    {
      query: PaginationModal.paginationQuery,
      response: PaginationModal.paginationResponse,
    }
  );
