import { OAuth2Client } from "google-auth-library";
import type { Role, User } from "./auth.model";
import { usersCol } from "./auth.model";
import { UserNotFoundError } from "../../core/errors";
import { AuditLogController } from "../auditLog/audit.controller";
import { AuditMeta } from "../auditLog/audit.model";

export type GoogleLoginInput = {
  id_token: string;
};

export type AuthResult = {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name?: string;
    picture?: string;
  };
};

export class AuthService {
  constructor(private auditController: AuditLogController) {}
  async createUser(email: string, role: Role, meta: AuditMeta) {
    const user = await usersCol.insertOne({
      email: email,
      role: role,
      ban: false,
      createdAt: new Date(),
    });

    this.auditController.audit({
      ...meta,
      action: "CREATE_USER",
      changes: {
        before: null,
        after: { email: email, role: role },
      },
      target: {
        type: "USER",
        id: user.insertedId.toString(),
      },
    });

    return user;
  }

  async updateUserBan(email: string, banStatus: boolean, meta: AuditMeta) {
    const result = await usersCol.findOneAndUpdate(
      { email },
      {
        $set: { ban: banStatus },
      },
    );
    if (!result) throw new UserNotFoundError();

    this.auditController.audit({
      ...meta,
      action: banStatus ? "RESTRICT_USER" : "UNRESTRICT_USER",
      changes: {
        before: { ban: !banStatus },
        after: { ban: banStatus },
      },
      target: {
        type: "USER",
        id: result._id.toString(),
      },
    });
    return result;
  }

  async updateUserRole(email: string, newRole: Role, meta: AuditMeta) {
    const exist = this.findUserByEmail(email);
    if (!exist) throw UserNotFoundError;
    const result = await usersCol.findOneAndUpdate(
      { email },
      { $set: { role: newRole } },
      { returnDocument: "before" },
    );

    if (!result) throw new UserNotFoundError();

    this.auditController.audit({
      ...meta,
      action: newRole === "Admin" ? "PROMOTE_USER" : "DEMOTE_USER",
      changes: {
        before: { role: result?.role },
        after: { ban: newRole },
      },
      target: {
        type: "USER",
        id: result._id.toString(),
      },
    });
    return result;
  }

  async findUserByEmail(email: string) {
    return await usersCol.findOne({ email: email });
  }

  async getAll() {
    return await usersCol.find({}).toArray();
  }

  async findOrCreateUserByEmail(email: string) {
    const user = await usersCol.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          email,
          role: "User",
          createdAt: new Date(),
        },
      },
      {
        upsert: true,
        returnDocument: "after",
      },
    );
    return user;
  }
}
