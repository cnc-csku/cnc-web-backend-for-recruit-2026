import { JWT } from "next-auth/jwt";

export type AuthActor = {
  userId: string | null;
  email: string;
};

export type AuthContextValue = {
  actor: AuthActor;
  role: string | null;
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

  public static toActor(payload: JWT | null): AuthActor {
    return {
      userId: payload?.sub ?? null,
      email: payload?.email ?? "anonymous",
    };
  }

  public static toAuth(payload: JWT | null): AuthContextValue {
    return {
      actor: this.toActor(payload),
      role: payload?.role ?? null,
      payload,
    };
  }
}
