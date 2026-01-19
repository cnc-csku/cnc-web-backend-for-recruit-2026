export type JwtPayload = {
    sub?: string;
    email?: string;
    name?: string;
    role?: string;
    iat?: number;
    exp?: number;
};

export type AuthActor = {
    userId: string | null;
    email: string;
}

export type AuthContextValue = {
    actor: AuthActor;
    role: string | null;
    payload: JwtPayload | null;
}

export class AuthUtils {
    public static getBearerToken(authorization?: string | null): string | null {
        if(!authorization) 
            return null;
        const [scheme, token] = authorization.split(" ");
        if(!scheme || !token)
            return null;
        if(scheme.toLowerCase() != "bearer")
            return null;
        return token.trim() || null;
    }

    public static toActor(payload: JwtPayload | null): AuthActor {
        return {
            userId: payload?.sub ?? null,
            email: payload?.email ?? "anonymous",
        };
    }

    public static toAuth(payload: JwtPayload | null): AuthContextValue {
        return {
            actor: this.toActor(payload),
            role: payload?.role ?? null,
        payload,
        };
    }
}