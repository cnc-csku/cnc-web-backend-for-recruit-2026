import { Elysia } from "elysia";
import { CandidateModel } from "./candidate.model";
import { candidateController } from "../../lib/controllers";
//TODO: get profile from auth
//TODO: Middleware rate limit

export const candidateRoute = new Elysia({ prefix: "/candidates" })
  .decorate("candidateController", candidateController)
  .get("/:id", async ({ params, candidateController }) => {
    const candidateId = params.id;
    return await candidateController.getCandidate(candidateId);
  })
  .put(
    "/:id",
    async ({ params, body, candidateController }) => {
      const candidateId = params.id;
      return await candidateController.updateCandidate(candidateId, body);
    },
    {
      body: CandidateModel.createCandidateBody,
    }
  )
  .post(
    "/submit",
    async ({ body, candidateController }) => {
      return await candidateController.createCandidate(body);
    },
    {
      body: CandidateModel.createCandidateBody,
    }
  )
  .delete("/:id", async ({ params }) => {
    const candidateId = params.id;
    return await candidateController.deleteCandidate(candidateId);
  });
