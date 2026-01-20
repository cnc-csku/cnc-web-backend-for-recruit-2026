import { t } from "elysia";
import { db } from "../../core/db";
import type { ObjectId } from "mongodb";

const RoleSchema = t.Union([t.Literal("Admin"), t.Literal("User")]);

export const UserModel = {
  user: t.Object({
    email: t.String(),
    role: RoleSchema,
    ban: t.Boolean(),
    createdAt: t.Date(),
  }),
  createAdmin: t.Object({
    email: t.String(),
  }),
};

export type Role = typeof RoleSchema.static;
export type User = typeof UserModel.user.static;
export const usersCol = (await db()).collection<User>("users");
