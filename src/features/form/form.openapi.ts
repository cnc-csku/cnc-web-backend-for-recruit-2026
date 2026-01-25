import { OpenApiDetail } from "../../../shared/shared.model";

export const formOpenApi: Record<string, OpenApiDetail> = {
  getFormSchedule: {
    operationId: "getFormSchedule",
    summary: "Get form schedule infomation",
    description: "retrive infomation about form schedule and deadlines",
    tags: ["Form"],
  },
  setFormSchedule: {
    operationId: "adminSetFormSchedule",
    summary: "Set form schedule (admin)",
    description: "Set the opening and closing time for the candidate form",
    tags: ["Form"],
  },

  setAllowSubmit: {
    operationId: "adminSetAllowSubmit",
    summary: "Set allow submit (admin)",
    description: "Enable or disable form submission",
    tags: ["Form"],
  },

  setCountdown: {
    operationId: "adminSetCountdown",
    summary: "Set countdown (admin)",
    description: "Set the countdown context to show on submission page",
    tags: ["Form"],
  },

  setEditableUntil: {
    operationId: "adminSetEditableUntil",
    summary: "Set editable until (admin)",
    description: "Set the deadline until which submitted forms can be edited",
    tags: ["Form"],
  },
};
