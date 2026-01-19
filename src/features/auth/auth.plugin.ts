import Elysia from "elysia";
import { AuthContextValue, AuthUtils } from "./auth.utils";
import { decode } from "next-auth/jwt";

export const authPlugin = new Elysia({ name: "auth" }).derive(
  { as: "global" },
  async ({ headers }): Promise<{ auth: AuthContextValue }> => {
    const token = AuthUtils.getBearerToken(headers?.authorization);

    if (!token) {
      return { auth: AuthUtils.toAuth(null) };
    }

    try {
      const decoded = await decode({
        token: token,
        secret: process.env.NEXTAUTH_SECRET!,
      });

      if (!decoded?.sub || !decoded?.email) {
        return { auth: AuthUtils.toAuth(null) };
      }

      return { auth: AuthUtils.toAuth(decoded) };
    } catch (err) {
      console.log(err);

      return { auth: AuthUtils.toAuth(null) };
    }
  },
);
