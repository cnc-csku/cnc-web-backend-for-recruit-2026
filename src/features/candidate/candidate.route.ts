import { Elysia } from "elysia";
import { CandidateModel } from "./candidate.model";
import { CandidateController } from "./candidate.controller";
import { CandidateService } from "./candidate.service";

const candidateService = new CandidateService();
const candidateController = new CandidateController(candidateService);

export const candidateRoute = new Elysia({ prefix: "/candidates" })
  .decorate("candidateController", candidateController)
  .get("/", async () => {
    return await candidateController.getAllCandidates();
  })
  .post(
    "/submit",
    async ({ body, candidateController }) => {
      return await candidateController.createCandidate(body);
    },
    {
      body: CandidateModel.createCandidateBody,
    }
  );
