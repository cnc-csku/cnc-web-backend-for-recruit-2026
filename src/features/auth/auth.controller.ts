import { z } from "zod";
import type { AuthService } from "./auth.service";
import { Role } from "./auth.model";
import { AuditMeta } from "../auditLog/audit.model";

export const GoogleLoginSchema = z.object({
  id_token: z.string().min(10),
});

export class AuthController {
  constructor(private service: AuthService) {}

  async createUser(email: string, role: Role, meta: AuditMeta) {
    return await this.service.createUser(email, role, meta);
  }

  async updateUserRole(email: string, newRole: Role, meta: AuditMeta) {
    return await this.service.updateUserRole(email, newRole, meta);
  }
  async findUserByEmail(email: string) {
    return await this.service.findUserByEmail(email);
  }

  async isBan(email: string) {
    const user = await this.findUserByEmail(email);
    return user?.ban === true;
  }
  async ensureUserByEmail(email: string) {
    return await this.service.findOrCreateUserByEmail(email);
  }

  async promoteToAdmin(email: string, meta: AuditMeta) {
    //create user first if non exist
    await this.service.findOrCreateUserByEmail(email);
    const user = this.service.updateUserRole(email, "Admin", meta);
    return true;
  }

  async demoteToAdmin(email: string, meta: AuditMeta) {
    //create user first if non exist
    await this.service.findOrCreateUserByEmail(email);
    const user = this.service.updateUserRole(email, "User", meta);
    return true;
  }

  async getAll() {
    return await this.service.getAll();
  }

  async banUser(email: string, meta: AuditMeta) {
    return await this.service.updateUserBan(email, true, meta);
  }

  async unBanUser(email: string, meta: AuditMeta) {
    return await this.service.updateUserBan(email, false, meta);
  }
}
