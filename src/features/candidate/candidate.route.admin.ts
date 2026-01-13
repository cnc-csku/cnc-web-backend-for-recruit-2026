import { Elysia, t } from "elysia";
import { CandidateModel, InterviewStatus } from "./candidate.model";
import { InterviewQuestionModel } from "../interviewQuestion/interviewQuestion.model";
import { candidateController } from "../../lib/controllers";
import { auditPlugin } from "../auditLog/audit.plugin";

//TODO: get profile from auth
//TODO: Middleware rate limit

export const candidateAdminRoute = new Elysia({ prefix: "/candidates" })
  .use(auditPlugin)
  .decorate("candidateController", candidateController)
  .get("/", async ({ candidateController }) => {
    return await candidateController.getAllCandidates();
  })
  .patch(
    "/:id",
    async ({ params, body, candidateController, meta }) => {
      const candidateId = params.id;
      return await candidateController.updateCandidate(
        candidateId,
        body,
        true,
        meta
      );
    },
    { body: CandidateModel.createCandidateBody }
  )
  .get("/:id/interview-questions", async ({ params, candidateController }) => {
    const candidateId = params.id;
    return await candidateController.getInterViewQuestions(candidateId);
  })
  .post(
    "/:id/interview-questions",
    async ({ params, body, candidateController, meta }) => {
      const candidateId = params.id;
      return await candidateController.addInterViewQuestion(
        candidateId,
        body,
        meta
      );
    },
    {
      body: InterviewQuestionModel.createInterviewQuestionBody,
    }
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
        meta
      );
    },
    {
      body: InterviewQuestionModel.createInterviewQuestionBody,
    }
  )
  .delete(
    "/:id/interview-questions/:questionId",
    async ({ params, candidateController, meta }) => {
      const questionId = params.questionId;
      return await candidateController.deleteInterviewQuestion(
        questionId,
        meta
      );
    }
  )
  .patch(
    "/:id/interview-status",
    async ({ params, body, candidateController, meta }) => {
      return await candidateController.updateCandidateInterviewStatus(
        params.id,
        body.interviewStatus,
        meta
      );
    },
    {
      body: t.Object({
        interviewStatus: InterviewStatus,
      }),
    }
  );
