import { decode, JWT } from "next-auth/jwt";
import { Role, User } from "./auth.model";
import { WithId } from "mongodb";
import { Unauthorized } from "../../core/errors";
import { config } from "../../core/config";

export type AuthUser = {
  userId: string | null;
  email: string;
  role: Role;
};

export type AuthContextValue = {
  user: AuthUser;
  payload: JWT;
};

export class AuthUtils {
  public static getBearerToken(authorization?: string | null): string | null {
    if (!authorization) return null;
    const [scheme, token] = authorization.split(" ");
    if (!scheme || !token) return null;
    if (scheme.toLowerCase() != "bearer") return null;
    return token.trim() || null;
  }

  public static toUser(user: WithId<User>): AuthUser {
    return {
      userId: user._id.toString(),
      role: user.role,
      email: user?.email ?? "anonymous",
    };
  }

  public static toAuth(payload: JWT, user: WithId<User>): AuthContextValue {
    return {
      user: this.toUser(user),
      payload,
    };
  }

  public static async verifyToken(token: string | null) {
    if (!token) throw new Unauthorized();
    try {
      const payload = await decode({
        token,
        secret: config.authSecret!,
      });
      if (!payload?.sub || !payload.email) {
        throw new Unauthorized();
      }

      if (payload?.exp && (payload?.exp as number) * 1000 < Date.now()) {
        throw new Unauthorized();
      }
      return payload;
    } catch {
      throw new Unauthorized();
    }
  }
}
