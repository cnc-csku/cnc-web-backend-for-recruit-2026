import { db } from "../../core/db";
import type { ObjectId } from "mongodb";

export type User = {
  _id?: ObjectId;
  googleSub: string;
  email: string;
  name?: string;
  picture?: string;
  createdAt: Date;
  updatedAt: Date;
};

export const usersCol = db().collection<User>("users");