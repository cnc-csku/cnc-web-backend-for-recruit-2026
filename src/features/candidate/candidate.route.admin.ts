import { Elysia, t } from "elysia";
import { CandidateModel, InterviewStatus } from "./candidate.model";
import { InterviewQuestionModel } from "../interviewQuestion/interviewQuestion.model";
import { candidateController } from "../../lib/controllers";
import { auditPlugin } from "../auditLog/audit.plugin";
import { candidateOpenApi } from "./candidate.openapi";

//TODO: get profile from auth
//TODO: Middleware rate limit

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
    "/:id/interview-questions",
    async ({ params, body, candidateController, meta }) => {
      const candidateId = params.id;
      return await candidateController.addInterViewQuestion(
        candidateId,
        body,
        meta,
      );
    },
    {
      body: InterviewQuestionModel.createInterviewQuestionBody,
      detail: candidateOpenApi.addInterviewQuestion,
    },
  )
  .put(
    "/:id/interview-questions/:questionId",
    async ({ params, body, candidateController, meta }) => {
      const candidateId = params.id;
      const questionId = params.questionId;
      return await candidateController.updateInterViewQuestion(
        candidateId,
        questionId,
        body,
        meta,
      );
    },
    {
      body: InterviewQuestionModel.createInterviewQuestionBody,
      detail: candidateOpenApi.updateInterviewQuestion,
    },
  )
  .delete(
    "/:id/interview-questions/:questionId",
    async ({ params, candidateController, meta }) => {
      const questionId = params.questionId;
      return await candidateController.deleteInterviewQuestion(
        questionId,
        meta,
      );
    },
    {
      detail: candidateOpenApi.deleteInterviewQuestion,
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
  );
