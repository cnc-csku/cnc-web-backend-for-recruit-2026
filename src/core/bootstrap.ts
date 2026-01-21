import { formCol } from "../features/form/form.model";
import { authController } from "../lib/controllers";
import { logger } from "./logger";
import { minio } from "./storage/storage.client";

const ADMIN_DEFUALT_EMAIL = ["thanut.tha@ku.th", "wachirawich.s@ku.th"];
async function ensureBucket(bucket: string) {
  const exists = await minio.bucketExists(bucket);
  if (!exists) await minio.makeBucket(bucket);
}

async function ensurePublicBucket(bucket: string) {
  await ensureBucket(bucket);

  const publicReadPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  };
  await minio.setBucketPolicy(bucket, JSON.stringify(publicReadPolicy));
}

async function ensureAdminUser() {
  for (const email of ADMIN_DEFUALT_EMAIL) {
    let user = await authController.findUserByEmail(email);
    if (!user) {
      const result = await authController.createUser(email, "Admin");
      user = {
        _id: result.insertedId,
        role: "Admin",
        email: email,
        ban: false,
        createdAt: new Date(),
      };
    }
    if (user.role !== "Admin") {
      await authController.updateUserRole(email, "Admin");
      logger.info(`[boostrap] ⬆️ User promoted to admin: ${email}`);
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

  await ensureAdminUser();
  await ensureBucket("cnc-transcript");
  await ensurePublicBucket("cnc-profile");
}
