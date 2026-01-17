import Elysia from "elysia";
import { auditLogController } from "../../lib/controllers";
import { PaginationModal } from "../../../shared/shared.model";
import { auditOpenApi } from "./audit.openapi";
import { candidateOpenApi } from "../candidate/candidate.openapi";

export const auditLogAdminRoute = new Elysia({ prefix: "/audit" })
  .decorate("auditLogController", auditLogController)
  .get(
    "/",
    async ({ auditLogController, query }) => {
      return await auditLogController.getAllAuditLog(query);
    },
    {
      query: PaginationModal.paginationQuery,
      response: PaginationModal.paginationResponse,
      detail: auditOpenApi.getAll,
    },
  );
