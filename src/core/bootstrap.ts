import { CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import { formCol } from "../features/form/form.model";
import { db } from "./db";
import { s3 } from "./storage/storage.client";

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

export async function bootstrapFormConfig() {
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

  await ensureBucket("uploads");
}
