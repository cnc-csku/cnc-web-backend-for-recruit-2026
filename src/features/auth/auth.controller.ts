import { z } from "zod";
import type { AuthService } from "./auth.service";

export const GoogleLoginSchema = z.object({
  id_token: z.string().min(10),
});

export class AuthController {
  constructor(private service: AuthService) {}

  async googleLogin(body: unknown, signJwt: (payload: any) => Promise<string>) {
    const parsed = GoogleLoginSchema.parse(body);
    return this.service.loginWithGoogleIdToken(parsed, signJwt);
  }
}