import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { authOpenApi } from "./auth.openapi";

const authService = new AuthService({
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
});

const authController = new AuthController(authService);

export const authRoute = new Elysia({ prefix: "/auth" })
  .decorate("authService", authService)
  .decorate("authController", authController)
  .get(
    "/me",
    async ({ auth }) => {
      return {
        user: auth.user,
      };
    },
    { detail: authOpenApi.me },
  );
