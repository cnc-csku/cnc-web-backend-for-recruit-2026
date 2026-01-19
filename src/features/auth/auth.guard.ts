import Elysia from "elysia";
import { AuthContextValue, AuthUtils } from "./auth.utils";
import { decode } from "next-auth/jwt";
import { authController } from "../../lib/controllers";
import { Forbidden, Unauthorized } from "../../core/errors";
import { Role } from "./auth.model";

export const requireRole = (role: Role) =>
  new Elysia({ name: "require" }).onBeforeHandle(
    { as: "scoped" },
    async ({ auth }) => {
      if (auth.user.role !== role) {
        throw new Forbidden();
      }
    },
  );

export const authGuard = new Elysia({ name: "guard" })
  .decorate("authController", authController)
  .derive(
    { as: "global" },
    async ({
      headers,
      authController,
      path,
    }): Promise<{ auth: AuthContextValue }> => {
      const token = AuthUtils.getBearerToken(headers?.authorization);
      if (!token) throw new Unauthorized();

      let payload;

      try {
        payload = await decode({
          token: token,
          secret: process.env.NEXTAUTH_SECRET!,
        });
      } catch (err) {
        throw new Unauthorized();
      }

      if (!payload?.sub || !payload?.email) {
        throw new Unauthorized();
      }

      let user = await authController.findUserByEmail(payload.email);
      if (!user) {
        try {
          const result = await authController.createUser(payload.email, "User");

          user = {
            _id: result.insertedId,
            role: "User",
            email: payload.email,
            createdAt: new Date(),
          };
        } catch (e: any) {
          // handle race condition
          if (e.code === 11000) {
            user = await authController.findUserByEmail(payload.email);
          } else {
            throw e;
          }
        }
      }
      return { auth: AuthUtils.toAuth(payload, user!) };
    },
  );
