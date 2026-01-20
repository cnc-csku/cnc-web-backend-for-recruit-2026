import { OAuth2Client } from "google-auth-library";
import type { Role, User } from "./auth.model";
import { usersCol } from "./auth.model";
import { UserNotFoundError } from "../../core/errors";

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
  private googleClient: OAuth2Client;

  constructor(private opts: { googleClientId: string }) {
    this.googleClient = new OAuth2Client(opts.googleClientId);
  }

  async createUser(email: string, role: Role) {
    return await usersCol.insertOne({
      email: email,
      role: role,
      ban: false,
      createdAt: new Date(),
    });
  }

  async updateUserBan(email: string, banStatus: boolean) {
    return await usersCol.updateOne(
      { email },
      {
        ban: banStatus,
      },
    );
  }

  async updateUserRole(email: string, newRole: Role) {
    const exist = this.findUserByEmail(email);
    if (!exist) throw UserNotFoundError;
    return await usersCol.updateOne({ email }, { $set: { role: newRole } });
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
