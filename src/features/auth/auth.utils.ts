import { JWT } from "next-auth/jwt";
import { Role, User } from "./auth.model";
import { WithId } from "mongodb";

export type AuthUser = {
  userId: string | null;
  email: string;
  role: Role;
};

export type AuthContextValue = {
  user: AuthUser;
  payload: JWT | null;
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

  public static toAuth(
    payload: JWT | null,
    user: WithId<User>,
  ): AuthContextValue {
    return {
      user: this.toUser(user),
      payload,
    };
  }
}
