import { Elysia } from "elysia";
import { authOpenApi } from "./auth.openapi";
import { authGuard } from "./auth.guard";
import { authController } from "../../lib/controllers";
import { UserModel } from "./auth.model";
import { auditPlugin } from "../auditLog/audit.plugin";

export const authAdminRoute = new Elysia({ prefix: "/users" })
  .use(authGuard)
  .use(auditPlugin)
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
    async ({ body, authController, meta }) => {
      const email = body.email;
      await authController.promoteToAdmin(email, meta);
      return { ok: true };
    },
    { body: UserModel.createAdmin, detail: authOpenApi.promote },
  )
  .put(
    "/demote",
    async ({ body, authController, meta }) => {
      const email = body.email;
      await authController.demoteToAdmin(email, meta);
      return { ok: true };
    },
    { body: UserModel.createAdmin, detail: authOpenApi.demote },
  )
  .put(
    "/restrict",
    async ({ body, authController, meta }) => {
      await authController.banUser(body.email, meta);
      return { ok: true };
    },
    { body: UserModel.createAdmin, detail: authOpenApi.restrict },
  )
  .put(
    "/un-restrict",
    async ({ body, authController, meta }) => {
      await authController.unBanUser(body.email, meta);
      return { ok: true };
    },
    { body: UserModel.createAdmin, detail: authOpenApi.unrestrict },
  );
