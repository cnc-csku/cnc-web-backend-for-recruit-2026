import { Elysia } from "elysia";
import { CandidateModel } from "./candidate.model";
import { CandidateController } from "./candidate.controller";
import { CandidateService } from "./candidate.service";

const candidateService = new CandidateService();
const candidateController = new CandidateController(candidateService);

export const candidateRoute = new Elysia({ prefix: "/candidate" })
  .decorate("candidateController", candidateController)
  .get("/", () => {})
  .post(
    "/submit",
    ({ body }) => {
      return "hi";
    },
    {
      body: CandidateModel.createCandidateBody,
    }
  );
