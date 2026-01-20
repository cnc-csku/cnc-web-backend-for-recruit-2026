import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { authOpenApi } from "./auth.openapi";
import { authGuard } from "./auth.guard";
import { authController } from "../../lib/controllers";
import { UserModel } from "./auth.model";

export const authAdminRoute = new Elysia({ prefix: "/users" })
  .use(authGuard)
  .decorate("authController", authController)
  .get(
    "/",
    async ({ body, authController }) => {
      return authController.getAll();
    },
    { detail: authOpenApi.me },
  )
  .put(
    "/promote",
    async ({ body, authController }) => {
      const email = body.email;
      await authController.promoteToAdmin(email);
      return { ok: true };
    },
    { body: UserModel.createAdmin, detail: authOpenApi.promote },
  )
  .put(
    "/demote",
    async ({ body, authController }) => {
      const email = body.email;
      await authController.demoteToAdmin(email);
      return { ok: true };
    },
    { body: UserModel.createAdmin, detail: authOpenApi.demote },
  )
  .put(
    "/restrict",
    async ({ body, authController }) => {
      await authController.banUser(body.email);
      return { ok: true };
    },
    { body: UserModel.createAdmin, detail: authOpenApi.restrict },
  )
  .put(
    "/un-restrict",
    async ({ body, authController }) => {
      await authController.unBanUser(body.email);
      return { ok: true };
    },
    { body: UserModel.createAdmin, detail: authOpenApi.unrestrict },
  );
