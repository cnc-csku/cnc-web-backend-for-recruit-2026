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

  async loginWithGoogleIdToken(
    input: GoogleLoginInput,
    signJwt: (payload: any) => Promise<string>,
  ): Promise<AuthResult> {
    const ticket = await this.googleClient.verifyIdToken({
      idToken: input.id_token,
      audience: this.opts.googleClientId,
    });

    const payload = ticket.getPayload();
    if (!payload) throw new Error("Invalid Google token payload");

    const email = payload.email;
    const emailVerified = payload.email_verified;
    if (!email || !emailVerified) throw new Error("Email not verified");

    if (!email.toLowerCase().endsWith("@ku.th")) {
      throw new Error("Only @ku.th accounts are allowed");
    }

    const googleSub = payload.sub; // unique user id
    const name = payload.name ?? undefined;
    const picture = payload.picture ?? undefined;

    const now = new Date();
    const update: Partial<User> = {
      googleSub,
      email,
      name,
      picture,
      updatedAt: now,
    };

    const existing = await usersCol.findOne({ googleSub });
    if (!existing) {
      await usersCol.insertOne({
        ...update,
        createdAt: now,
      } as User);
    } else {
      await usersCol.updateOne({ googleSub }, { $set: update });
    }

    const accessToken = await signJwt({
      sub: googleSub,
      email,
      name,
      role: "user",
    });

    return {
      accessToken,
      user: {
        id: googleSub,
        email,
        name,
        picture,
      },
    };
  }

  async createUser(email: string, role: Role) {
    return await usersCol.insertOne({
      email: email,
      role: role,
      createdAt: new Date(),
    });
  }

  async updateUserRole(email: string, newRole: Role) {
    const exist = this.findUserByEmail(email);
    if (!exist) throw UserNotFoundError;
    return await usersCol.updateOne({ email }, { $set: { role: newRole } });
  }

  async findUserByEmail(email: string) {
    return await usersCol.findOne({ email: email });
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
