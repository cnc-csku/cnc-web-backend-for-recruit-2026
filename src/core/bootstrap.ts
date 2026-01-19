import { CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { formCol } from "../features/form/form.model";
import { db } from "./db";
import { s3 } from "./storage/storage.client";
import { usersCol } from "../features/auth/auth.model";
import { authController } from "../lib/controllers";

const ADMIN_DEFUALT_EMAIL = ["thanut.tha@ku.th"];
async function ensureBucket(bucket: string) {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (err: any) {
    if (err.$metadata?.httpStatusCode === 404) {
      await s3.send(new CreateBucketCommand({ Bucket: bucket }));
    } else {
      throw err;
    }
  }
}

async function ensureAdminUser() {
  for (const email of ADMIN_DEFUALT_EMAIL) {
    let user = await authController.findUserByEmail(email);
    if (!user) {
      const result = await authController.createUser(email, "Admin");
      user = {
        _id: result.insertedId,
        role: "User",
        email: email,
        createdAt: new Date(),
      };
    }
    if (user.role !== "Admin") {
      await authController.updateUserRole(email, "Admin");

      console.log(`⬆️ User promoted to admin: ${email}`);
    }
  }
}

export async function bootstrap() {
  await formCol.updateOne(
    { _id: "FORM_CONFIG" },
    {
      $setOnInsert: {
        _id: "FORM_CONFIG",
        allowSubmit: false,
        opensAt: new Date("2099-01-01T00:00:00Z").toISOString(),
        closesAt: new Date("2099-01-02T00:00:00Z").toISOString(),
        editableUntil: new Date("2099-01-02T00:00:00Z").toISOString(),
        createdAt: new Date().toISOString(),
      },
    },
    { upsert: true },
  );

  await usersCol.updateOne(
    { _id: "FORM_CONFIG" },
    {
      $setOnInsert: {
        _id: "FORM_CONFIG",
        allowSubmit: false,
        opensAt: new Date("2099-01-01T00:00:00Z").toISOString(),
        closesAt: new Date("2099-01-02T00:00:00Z").toISOString(),
        editableUntil: new Date("2099-01-02T00:00:00Z").toISOString(),
        createdAt: new Date().toISOString(),
      },
    },
    { upsert: true },
  );
  await ensureAdminUser();

  await ensureBucket("uploads");
}
