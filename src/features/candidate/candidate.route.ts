import { Elysia } from "elysia";
import { CandidateModel } from "./candidate.model";
import { candidateController } from "../../lib/controllers";
import { ip } from "elysia-ip";
import { auditPlugin } from "../auditLog/audit.plugin";
//TODO: get profile from auth
//TODO: Middleware rate limit

export const candidateRoute = new Elysia({ prefix: "/candidates" })
  .use(auditPlugin)
  .decorate("candidateController", candidateController)
  .get("/:id", async ({ params, candidateController }) => {
    return await candidateController.getCandidate(params.id);
  })
  .put(
    "/:id",
    async ({ params, body, candidateController, meta }) => {
      return await candidateController.updateCandidate(
        params.id,
        body,
        false,
        meta
      );
    },
    {
      body: CandidateModel.createCandidateBody,
    }
  )
  .post(
    "/submit",
    async ({ body, candidateController, meta }) => {
      return await candidateController.createCandidate(body, meta);
    },
    {
      body: CandidateModel.createCandidateBody,
    }
  )
  .delete("/:id", async ({ params, meta }) => {
    return await candidateController.deleteCandidate(params.id, meta);
  })

  //Interview Slot
  .post(":candidateId/interview-slot", () => {})
  .patch(":candidateId/interview-slot", () => {})
  .delete(":candidateId/interview-slot", () => {})


