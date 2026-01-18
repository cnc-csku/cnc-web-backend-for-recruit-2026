import { Elysia } from "elysia";
import { candidateRoute } from "./features/candidate/candidate.route";
import { DomainError } from "./core/errors";
import { adminRoute } from "./features/admin/admin.route";
import { bootstrapFormConfig } from "./core/bootstrap";
import { formRoute } from "./features/form/form.route";
import { ip } from "elysia-ip";
import openapi from "@elysiajs/openapi";
import { openapiConfig, openapiTags } from "./core/openapi";

await bootstrapFormConfig();
export const app = new Elysia()
  .get("/", () => {
    return {
      name: "CNC Recruite Backend API",
      version: "1.0.0",
      status: "online",
      message: "Welcome to the API",
      documentation: "http://localhost:3000/openapi",
    };
  })
  .get("/health", () => ({ ok: true }), {
    detail: {
      operationId: "getHealth",
      summary: "Get health",
      description: "Check is server is good to go",
    },
  })
  .onError(({ error, set }) => {
    if (error instanceof DomainError) {
      set.status = error.statusCode;
      return {
        code: error.code,
        message: error.message,
      };
    } else {
      console.error(error);
    }
  })
  .use(ip())
  .use(openapi(openapiConfig))
  // .use(authRoute)
  .use(adminRoute)
  .use(candidateRoute)
  .use(formRoute);
