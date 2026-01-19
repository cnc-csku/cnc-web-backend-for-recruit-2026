import { OpenApiDetail } from "../../../shared/shared.model";

export const interviewSlotOpenApi: Record<string, OpenApiDetail> = {
  getAllSlots: {
    operationId: "adminGetAllInterviewSlots",
    summary: "Get all interview slots (admin)",
    description: "Retrieve all interview slots",
    tags: ["Interview Slot"],
  },

  createSlot: {
    operationId: "adminCreateInterviewSlot",
    summary: "Create interview slot (admin)",
    description: "Create a new interview slot for candidates",
    tags: ["Interview Slot"],
  },

  deleteSlot: {
    operationId: "adminDeleteInterviewSlot",
    summary: "Delete interview slot (admin)",
    description: "Delete an interview slot by slot ID",
    tags: ["Interview Slot"],
  },
};
