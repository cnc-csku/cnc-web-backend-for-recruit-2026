import { Elysia } from "elysia";
import { candidateRoute } from "./features/candidate/candidate.route";
import { DomainError } from "./core/errors";
import { adminRoute } from "./features/admin/admin.route";

export const app = new Elysia()
  .get("/health", () => ({ ok: true }))
  .onError(({ error, set }) => {
    if (error instanceof DomainError) {
      set.status = error.statusCode;
      return {
        code: error.code,
        message: error.message,
      };
    }
  })
  .use(adminRoute)
  .use(candidateRoute)
  .listen(4000);
