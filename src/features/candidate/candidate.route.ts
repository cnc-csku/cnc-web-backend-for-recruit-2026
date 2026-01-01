import {
  type CreateCandidateBody,
  type Candidate,
  CandidateModel,
} from "./candidate.model";
import { db } from "../../core/db";
import Elysia from "elysia";

new Elysia({ prefix: "/candidate" }).post(
  "/submit",
  ({ body }) => {
    return "hi";
  },
  {
    body: CandidateModel.createCandidateBody,
  }
);
