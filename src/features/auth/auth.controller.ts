import { z } from "zod";
import type { AuthService } from "./auth.service";
import { Role } from "./auth.model";

export const GoogleLoginSchema = z.object({
  id_token: z.string().min(10),
});

export class AuthController {
  constructor(private service: AuthService) {}

  async googleLogin(body: unknown, signJwt: (payload: any) => Promise<string>) {
    const parsed = GoogleLoginSchema.parse(body);
    return this.service.loginWithGoogleIdToken(parsed, signJwt);
  }
  async createUser(email: string, role: Role) {
    return await this.service.createUser(email, role);
  }

  async updateUserRole(email: string, newRole: Role) {
    return await this.service.updateUserRole(email, newRole);
  }
  async findUserByEmail(email: string) {
    return await this.service.findUserByEmail(email);
  }

  async ensureUserByEmail(email: string) {
    return await this.service.findOrCreateUserByEmail(email);
  }
}
