import { Elysia, t } from "elysia";
import { CandidateModel, InterviewStatus } from "./candidate.model";
import { InterviewQuestionModel } from "../interviewQuestion/interviewQuestion.model";
import { candidateController, interviewSlotController } from "../../lib/controllers";
import { auditPlugin } from "../auditLog/audit.plugin";
import { candidateOpenApi } from "./candidate.openapi";

export const candidateAdminRoute = new Elysia({ prefix: "/candidates" })
  .use(auditPlugin)
  .decorate("candidateController", candidateController)
  .get(
    "/",
    async ({ candidateController }) => {
      return await candidateController.getAllCandidates();
    },
    {
      detail: candidateOpenApi.getAllCandidates,
    },
  )
  .patch(
    "/:id",
    async ({ params, body, candidateController, meta }) => {
      const candidateId = params.id;
      return await candidateController.updateCandidate(
        candidateId,
        body,
        true,
        meta,
      );
    },
    {
      body: CandidateModel.updateCandidateBody,
      detail: candidateOpenApi.adminUpdateCandidate,
    },
  )
  .get(
    "/:id/interview-questions",
    async ({ params, candidateController }) => {
      const candidateId = params.id;
      return await candidateController.getInterViewQuestions(candidateId);
    },
    {
      detail: candidateOpenApi.getInterviewQuestions,
    },
  )
  .post(
    "/:id/interview-questions/init",
    async ({ params, candidateController, meta }) => {
      const candidateId = params.id;
      return await candidateController.initInterViewQuestions(
        candidateId,
        meta,
      );
    },
    {
      detail: candidateOpenApi.initInterviewQuestions,
    },
  )
  .post(
    "/:id/interview-questions/questions",
    async ({ params, body, candidateController, meta }) => {
      const candidateId = params.id;
      return await candidateController.addInterViewQuestion(
        candidateId,
        body,
        meta,
      );
    },
    {
      body: InterviewQuestionModel.addQuestionBody,
      detail: candidateOpenApi.addInterviewQuestion,
    },
  )
  .patch(
    "/:id/interview-questions/questions/:room/:index",
    async ({ params, body, candidateController, meta }) => {
      const candidateId = params.id;
      const room = params.room as "attitude" | "technical";
      const index = parseInt(params.index);
      return await candidateController.updateInterViewQuestion(
        candidateId,
        room,
        index,
        body,
        meta,
      );
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        answer: t.Optional(t.String()),
        score: t.Optional(t.Number({ minimum: 0, maximum: 10 })),
      }),
      params: t.Object({
        id: t.String(),
        room: t.Union([t.Literal("attitude"), t.Literal("technical")]),
        index: t.String(),
      }),
      detail: candidateOpenApi.updateInterviewQuestion,
    },
  )
  .delete(
    "/:id/interview-questions/questions/:room/:index",
    async ({ params, candidateController, meta }) => {
      const candidateId = params.id;
      const room = params.room as "attitude" | "technical";
      const index = parseInt(params.index);
      return await candidateController.deleteInterViewQuestion(
        candidateId,
        room,
        index,
        meta,
      );
    },
    {
      params: t.Object({
        id: t.String(),
        room: t.Union([t.Literal("attitude"), t.Literal("technical")]),
        index: t.String(),
      }),
      detail: candidateOpenApi.deleteInterviewQuestion,
    },
  )
  .post(
    "/:id/interview-questions/reviewers",
    async ({ params, body, candidateController, meta }) => {
      const candidateId = params.id;
      return await candidateController.addInterViewReviewer(
        candidateId,
        body,
        meta,
      );
    },
    {
      body: InterviewQuestionModel.addReviewerBody,
      detail: candidateOpenApi.addReviewer,
    },
  )
  .patch(
    "/:id/interview-questions/voices",
    async ({ params, body, candidateController, meta }) => {
      const candidateId = params.id;
      return await candidateController.updateInterViewVoice(
        candidateId,
        body,
        meta,
      );
    },
    {
      body: InterviewQuestionModel.updateVoiceBody,
      detail: candidateOpenApi.updateVoice,
    },
  )
  .patch(
    "/:id/interview-status",
    async ({ params, body, candidateController, meta }) => {
      return await candidateController.updateCandidateInterviewStatus(
        params.id,
        body.interviewStatus,
        meta,
      );
    },
    {
      body: t.Object({
        interviewStatus: InterviewStatus,
      }),
      detail: candidateOpenApi.updateInterviewStatus,
    },
  )
  .get(
    "/single",
    async ({ query, candidateController }) => {
      const { candidateId, candidateEmail } = query;

      if (candidateEmail) {
        return await candidateController.getCandidateByEmail(
          candidateEmail,
          true,
        );
      }

      if (candidateId) {
        return await candidateController.getCandidate(candidateId);
      }

      throw new Error(
        "Either candidateId or candidateEmail query parameter must be provided",
      );
    },
    {
      query: t.Object({
        candidateId: t.Optional(t.String()),
        candidateEmail: t.Optional(t.String()),
      }),
      detail: candidateOpenApi.adminGetCandidate,
    },
  )
  .post(
    "/:id/unassign-slot",
    async ({ params, body, interviewSlotController, meta }) => {
      const candidateId = params.id;
      const { slotId } = body as { slotId: string };
      return await interviewSlotController.unAssignCandidateFromSlot(
        candidateId,
        slotId,
        meta,
      );
    },
    {
      body: t.Object({
        slotId: t.String({ minLength: 24, maxLength: 24 }),
      }),
      detail: candidateOpenApi.unassignInterviewSlot,
    },
  );
