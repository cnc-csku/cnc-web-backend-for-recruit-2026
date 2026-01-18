import { Elysia } from "elysia";
import { candidateRoute } from "./features/candidate/candidate.route";
import { DomainError } from "./core/errors";
import { adminRoute } from "./features/admin/admin.route";
import { bootstrapFormConfig } from "./core/bootstrap";
import { formRoute } from "./features/form/form.route";
import { ip } from "elysia-ip";
import { cors } from "@elysiajs/cors";
import { rateLimit } from "elysia-rate-limit";
import { helmet } from "elysia-helmet";

await bootstrapFormConfig();
export const app = new Elysia({ aot: false })
  .use(ip())
  .use(rateLimit({ duration: 60000, max: 100 })) // allow 100 request per 1 minute
  .use(helmet())
  .use(
    cors({
      origin: ["http://localhost:3000", "https://app.example.com"],
      methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
      maxAge: 86400, //24h
    }),
  )
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
  // .use(authRoute)
  .use(adminRoute)
  .use(candidateRoute)
  .use(formRoute)
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
  });
