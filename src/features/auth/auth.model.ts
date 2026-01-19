import { t } from "elysia";
import { db } from "../../core/db";
import type { ObjectId } from "mongodb";

const RoleSchema = t.Union([t.Literal("Admin"), t.Literal("User")]);

export const UserModel = {
  user: t.Object({
    email: t.String(),
    role: RoleSchema,
    createdAt: t.Date(),
  }),
};

export type Role = typeof RoleSchema.static;
export type User = typeof UserModel.user.static;
export const usersCol = (await db()).collection<User>("users");
