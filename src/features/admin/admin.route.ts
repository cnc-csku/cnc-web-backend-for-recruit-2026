import Elysia from "elysia";
import { InterviewQuestionService } from "../interviewQuestion/interviewQuestion.service";
import { InterviewQuestionController } from "../interviewQuestion/interviewQuestion.controller";
import { CandidateService } from "../candidate/candidate.service";
import { CandidateController } from "../candidate/candidate.controller";
import { InterviewQuestionModel } from "../interviewQuestion/interviewQuestion.model";
import { CandidateModel } from "../candidate/candidate.model";

const interviewQuestionServive = new InterviewQuestionService();
const interviewQuestionController = new InterviewQuestionController(
  interviewQuestionServive
);
const candidateService = new CandidateService(interviewQuestionController);
const candidateController = new CandidateController(candidateService);

//TODO: add auth in admin route
export const adminRoute = new Elysia({ prefix: "/admin" })
  .decorate("candidateController", candidateController)
  .get("/candidates", async ({ candidateController }) => {
    return await candidateController.getAllCandidates();
  })
  .patch(
    "/candidates/:id",
    async ({ params, body, candidateController }) => {
      const candidateId = params.id;
      return await candidateController.updateCandidate(candidateId, body, true);
    },
    { body: CandidateModel.createCandidateBody }
  )
  .get(
    "/candidates/:id/interview-questions",
    async ({ params, candidateController }) => {
      const candidateId = params.id;
      return await candidateController.getInterViewQuestions(candidateId);
    }
  )
  .post(
    "/candidates/:id/interview-questions",
    async ({ params, body, candidateController }) => {
      const candidateId = params.id;
      return await candidateController.addInterViewQuestion(candidateId, body);
    },
    {
      body: InterviewQuestionModel.createInterviewQuestionBody,
    }
  )
  .put(
    "/candidates/:id/interview-questions/:questionId",
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
    "/candidates/:id/interview-questions/:questionId",
    async ({ params, candidateController }) => {
      const questionId = params.questionId;
      return await candidateController.deleteInterviewQuestion(questionId);
    }
  );
