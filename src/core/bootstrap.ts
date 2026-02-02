import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
} from "@aws-sdk/client-s3";
import { AuditMeta } from "../features/auditLog/audit.model";
import { formCol } from "../features/form/form.model";
import { authController } from "../lib/controllers";
import { config } from "./config";
import { logger } from "./logger";
import { s3Client } from "./storage/storage.client";

const ADMIN_DEFUALT_EMAIL = ["thanut.tha@ku.th", "worrapon.k@ku.th"];

async function ensureStorage() {
  const bucket = config.s3.bucket!;
  try {
    await s3Client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch (error) {
    logger.info(`Bucket ${bucket} not found, creating...`);
    await s3Client.send(new CreateBucketCommand({ Bucket: bucket }));
  }

  // Set public policy for profile images only
  const publicReadPolicy = {
    Version: "2012-10-17",
    Statement: [
      {
        Effect: "Allow",
        Principal: "*",
        Action: "s3:GetObject",
        Resource: `arn:aws:s3:::${bucket}/cnc-profile/*`,
      },
    ],
  };

  try {
    await s3Client.send(
      new PutBucketPolicyCommand({
        Bucket: bucket,
        Policy: JSON.stringify(publicReadPolicy),
      }),
    );
  } catch (error) {
    logger.error(`Failed to set bucket policy: ${error}`);
    // Non-fatal, usually because user doesn't have PutBucketPolicy permission
  }
}

async function ensureAdminUser() {
  for (const email of ADMIN_DEFUALT_EMAIL) {
    let user = await authController.findUserByEmail(email);
    const meta: AuditMeta = {
      actor: {
        email: "Boostrap system",
      },
      ip: "::1",
    };
    if (!user) {
      const result = await authController.createUser(email, "Admin", meta);
      user = {
        _id: result.insertedId,
        role: "Admin",
        email: email,
        ban: false,
        createdAt: new Date(),
      };
    }
    if (user.role !== "Admin") {
      await authController.updateUserRole(email, "Admin", meta);
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
        countdownTitle: null,
        countdownTime: null,
        timeupMessage: null,
        createdAt: new Date().toISOString(),
      },
    },
    { upsert: true },
  );

  await ensureAdminUser();
  await ensureStorage();
}
