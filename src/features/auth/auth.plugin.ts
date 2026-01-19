import Elysia from "elysia";
import { jwt as jwtPlugin } from '@elysiajs/jwt'
import { AuthContextValue, AuthUtils, JwtPayload } from "./auth.utils";

export const authPlugin = new Elysia({name: "auth"})
    .use(jwtPlugin({ name: "jwt", secret: process.env.JWT_SECRET! }))
    .derive(
        { as: "global" },
        async({headers, jwt}): Promise<{ auth: AuthContextValue }> => {
            const token = AuthUtils.getBearerToken(headers?.authorization);
            if(!token) {
                return {auth: AuthUtils.toAuth(null)};
            }

            try {
                const payload = (await (jwt as any).verify(token)) as JwtPayload;
                if(!payload?.sub || !payload?.email) {
                    return {auth: AuthUtils.toAuth(null)};
                }
                return {auth: AuthUtils.toAuth(payload)};
            } catch {
                return {auth: AuthUtils.toAuth(null)};
            }
        }
    );