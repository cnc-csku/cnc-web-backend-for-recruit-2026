import { OpenApiDetail } from "../../../shared/shared.model";

export const authOpenApi: Record<string, OpenApiDetail> = {
  me: {
    operationId: "me",
    summary: "Get Me",
    description: "To get data of current login user",
  },
};
