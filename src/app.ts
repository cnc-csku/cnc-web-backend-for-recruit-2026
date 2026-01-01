import { Elysia } from "elysia";
import { connectDB } from "./core/db";
import { candidateRoute } from "./features/candidate/candidate.route";

export const app = new Elysia()
  .get("/health", () => ({ ok: true }))
  .use(candidateRoute)
  .listen(4000);
