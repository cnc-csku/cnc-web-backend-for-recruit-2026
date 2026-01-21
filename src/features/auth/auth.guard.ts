import Elysia from "elysia";
import { AuthContextValue, AuthUtils } from "./auth.utils";
import { decode, JWT } from "next-auth/jwt";
import { authController } from "../../lib/controllers";
import { Forbidden, Unauthorized } from "../../core/errors";
import { Role } from "./auth.model";

export const requireRole = (role: Role) =>
  new Elysia({ name: "require" })
    .use(authGuard)
    .onBeforeHandle({ as: "scoped" }, async ({ auth }) => {
      if (auth.user.role !== role) {
        throw new Forbidden();
      }
    });

export const authGuard = new Elysia({ name: "guard" })
  .decorate("authController", authController)
  .derive(
    { as: "global" },
    async ({
      headers,
      authController,
    }): Promise<{ auth: AuthContextValue }> => {
      const token = AuthUtils.getBearerToken(headers?.authorization);
      const payload = await AuthUtils.verifyToken(token);

      let user = await authController.ensureUserByEmail(payload.email!);
      return { auth: AuthUtils.toAuth(payload, user!) };
    },
  );
