import { Elysia } from "elysia";
import { CandidateModel } from "./candidate.model";
import { InterviewQuestionModel } from "../interviewQuestion/interviewQuestion.model";
import { candidateController } from "../../lib/controllers";

//TODO: get profile from auth
//TODO: Middleware rate limit

export const candidateAdminRoute = new Elysia({ prefix: "/candidates" })
  .decorate("candidateController", candidateController)
  .get("/", async ({ candidateController }) => {
    return await candidateController.getAllCandidates();
  })
  .patch(
    "/:id",
    async ({ params, body, candidateController }) => {
      const candidateId = params.id;
      return await candidateController.updateCandidate(candidateId, body, true);
    },
    { body: CandidateModel.createCandidateBody }
  )
  .get("/:id/interview-questions", async ({ params, candidateController }) => {
    const candidateId = params.id;
    return await candidateController.getInterViewQuestions(candidateId);
  })
  .post(
    "/:id/interview-questions",
    async ({ params, body, candidateController }) => {
      const candidateId = params.id;
      return await candidateController.addInterViewQuestion(candidateId, body);
    },
    {
      body: InterviewQuestionModel.createInterviewQuestionBody,
    }
  )
  .put(
    "/:id/interview-questions/:questionId",
    async ({ params, body, candidateController }) => {
      const candidateId = params.id;
      const questionId = params.questionId;
      return await candidateController.updateInterViewQuestion(
        candidateId,
        questionId,
        body
      );
    },
    {
      body: InterviewQuestionModel.createInterviewQuestionBody,
    }
  )
  .delete(
    "/:id/interview-questions/:questionId",
    async ({ params, candidateController }) => {
      const questionId = params.questionId;
      return await candidateController.deleteInterviewQuestion(questionId);
    }
  );
