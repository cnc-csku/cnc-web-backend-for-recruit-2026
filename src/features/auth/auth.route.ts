import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";

const authService = new AuthService();

const authController = new AuthController(authService);

export const authRoute = new Elysia({ prefix: "/auth" })
  .decorate("authService", authService)
  .decorate("authController", authController);
