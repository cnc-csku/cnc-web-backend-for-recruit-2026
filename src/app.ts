import { Elysia } from "elysia";
import { candidateRoute } from "./features/candidate/candidate.route";
import { DomainError } from "./core/errors";

export const app = new Elysia()
  .get("/health", () => ({ ok: true }))
  .onError(({ error, set }) => {
    console.log(error);
    if (error instanceof DomainError) {
      set.status = error.statusCode;
      return {
        code: error.code,
        message: error.message,
      };
    }
  })
  .use(candidateRoute)
  .listen(4000);
