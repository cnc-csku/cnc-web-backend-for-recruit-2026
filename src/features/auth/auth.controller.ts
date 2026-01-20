import { z } from "zod";
import type { AuthService } from "./auth.service";
import { Role } from "./auth.model";

export const GoogleLoginSchema = z.object({
  id_token: z.string().min(10),
});

export class AuthController {
  constructor(private service: AuthService) {}

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

  async promoteToAdmin(email: string) {
    //create user first if non exist
    await this.service.findOrCreateUserByEmail(email);
    const user = this.service.updateUserRole(email, "Admin");
    return true;
  }

  async demoteToAdmin(email: string) {
    //create user first if non exist
    await this.service.findOrCreateUserByEmail(email);
    const user = this.service.updateUserRole(email, "User");
    return true;
  }

  async getAll() {
    return await this.service.getAll();
  }

  async banUser(email: string) {
    return await this.service.updateUserBan(email, true);
  }

  async unBanUser(email: string) {
    return await this.service.updateUserBan(email, false);
  }
}
