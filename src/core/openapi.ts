import { ElysiaOpenAPIConfig } from "@elysiajs/openapi";
import type { OpenAPIV3 } from "openapi-types";

export const openapiTags: OpenAPIV3.TagObject[] = [
  {
    name: "Candidate",
    description:
      "Candidate-facing APIs for registration, profile management, submission, withdrawal, and personal interview slot selection.",
  },
  {
    name: "Candidate / Interview Slot",
    description:
      "Candidate APIs for assigning, changing, and removing interview slot selections.",
  },
  {
    name: "Candidate / Interview Question",
    description:
      "Admin APIs for managing interview questions associated with a candidate.",
  },
  {
    name: "Form",
    description:
      "Admin APIs for configuring the recruitment form schedule, submission availability, and edit permissions.",
  },
  {
    name: "Interview Slot",
    description:
      "Admin APIs for creating, managing, and configuring available interview time slots.",
  },
  {
    name: "Audit",
    description: "Admin APIs for viewing audit logs and activity history.",
  },
];

export const openapiConfig: ElysiaOpenAPIConfig = {
  documentation: {
    info: {
      title: "CNC Recruite Backend API Documentation",
      version: "1.0.0",
    },
    tags: openapiTags,
  },
  swagger: { operationsSorter: "method", tagsSorter: "method" },
};
