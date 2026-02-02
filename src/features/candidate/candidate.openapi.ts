import { OpenApiDetail } from "../../../shared/shared.model";

export const candidateOpenApi: Record<string, OpenApiDetail> = {
  checkCandidate: {
    operationId: "checkCandidate",
    summary: "Check candidate",
    description: "To check is the user is already submitted candidate",
    tags: ["Candidate"],
  },

  getCandidate: {
    operationId: "getCandidate",
    summary: "Get candidate",
    description: "Retrieve candidate data by candidate ID",
    tags: ["Candidate"],
  },

  updateCandidate: {
    operationId: "updateCandidate",
    summary: "Update candidate",
    description: "Update candidate profile information",
    tags: ["Candidate"],
  },

  createCandidate: {
    operationId: "createCandidate",
    summary: "Create candidate",
    description: "Create a new candidate profile",
    tags: ["Candidate"],
  },

  deleteCandidate: {
    operationId: "deleteCandidate",
    summary: "Delete candidate",
    description: "Delete candidate by candidate ID",
    tags: ["Candidate"],
  },

  withdrawCandidate: {
    operationId: "withdrawCandidate",
    summary: "Withdraw candidate",
    description:
      "Withdraw a candidate from the recruitment process This action Canoot be undone",
    tags: ["Candidate"],
  },

  // ─────────────────────────────────────
  // Interview Slot
  // ─────────────────────────────────────

  assignInterviewSlot: {
    operationId: "assignInterviewSlot",
    summary: "Assign interview slot",
    description: "Assign a candidate to an interview slot",
    tags: ["Candidate / Interview Slot"],
  },

  changeInterviewSlot: {
    operationId: "changeInterviewSlot",
    summary: "Change interview slot",
    description: "Change the interview slot assigned to a candidate",
    tags: ["Candidate / Interview Slot"],
  },

  unassignInterviewSlot: {
    operationId: "unassignInterviewSlot",
    summary: "Unassign interview slot",
    description: "Remove a candidate from an interview slot",
    tags: ["Candidate / Interview Slot"],
  },
  getAllCandidates: {
    operationId: "adminGetAllCandidates",
    summary: "Get all candidates (admin)",
    description: "Retrieve all candidate profiles (admin only)",
    tags: ["Candidate"],
  },

  adminUpdateCandidate: {
    operationId: "adminUpdateCandidate",
    summary: "Update candidate (admin)",
    description:
      "Update candidate profile with admin privileges (not increment edit counter)",
    tags: ["Candidate"],
  },

  getInterviewQuestions: {
    operationId: "adminGetInterviewQuestions",
    summary: "Get interview questions (admin)",
    description: "Retrieve interview questions for a candidate",
    tags: ["Candidate / Interview Question"],
  },

  addInterviewQuestion: {
    operationId: "adminAddInterviewQuestion",
    summary: "Add interview question (admin)",
    description: "Add a new interview question to a candidate",
    tags: ["Candidate / Interview Question"],
  },

  updateInterviewQuestion: {
    operationId: "adminUpdateInterviewQuestion",
    summary: "Update interview question (admin)",
    description: "Update an existing interview question for a candidate",
    tags: ["Candidate / Interview Question"],
  },

  deleteInterviewQuestion: {
    operationId: "adminDeleteInterviewQuestion",
    summary: "Delete interview question (admin)",
    description: "Delete an interview question from a candidate",
    tags: ["Candidate / Interview Question"],
  },

  updateInterviewStatus: {
    operationId: "adminUpdateInterviewStatus",
    summary: "Update interview status (admin)",
    description: "Update the interview status of a candidate",
    tags: ["Candidate"],
  },

  adminGetCandidate: {
    operationId: "adminGetCandidate",
    summary: "Get candidate by ID or email (admin)",
    description:
      "Retrieve a single candidate profile by either candidate ID or candidate email (admin only)",
    tags: ["Candidate"],
  },
};
