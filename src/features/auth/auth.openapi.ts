import { OpenApiDetail } from "../../../shared/shared.model";

export const authOpenApi: Record<string, OpenApiDetail> = {
  me: {
    operationId: "me",
    summary: "Get Me",
    description: "To get data of current login user",
    tags: ["Auth"],
  },
  getUsers: {
    operationId: "getUsers",
    summary: "Get Users (admin)",
    description: "get all users in the system",
    tags: ["Auth"],
  },
  promote: {
    operationId: "promote",
    summary: "Promote (admin)",
    description: "change user role to Admin",
    tags: ["Auth"],
  },
  demote: {
    operationId: "demote",
    summary: "Demote (admin)",
    description: "change user role to User",
    tags: ["Auth"],
  },
  restrict: {
    operationId: "restrict",
    summary: "Restrict (admin)",
    description:
      "restrict user to access this api, cause user to nolonger use the system",
    tags: ["Auth"],
  },
  unrestrict: {
    operationId: "unrestrict",
    summary: "Unrestrict (admin)",
    description: "unrestrict user from being ban from the system",
    tags: ["Auth"],
  },
};
