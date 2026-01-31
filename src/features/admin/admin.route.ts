import Elysia from "elysia";
import { InterviewQuestionService } from "../interviewQuestion/interviewQuestion.service";
import { InterviewQuestionController } from "../interviewQuestion/interviewQuestion.controller";
import { CandidateService } from "../candidate/candidate.service";
import { CandidateController } from "../candidate/candidate.controller";
import { InterviewQuestionModel } from "../interviewQuestion/interviewQuestion.model";
import { CandidateModel } from "../candidate/candidate.model";
import { candidateAdminRoute } from "../candidate/candidate.route.admin";
import { interviewSlotAdminRoute } from "../InterviewSlot/interviewSlot.route.admin";
import { auditLogAdminRoute } from "../auditLog/audit.route.admin";
import { requireRole } from "../auth/auth.guard";
import { authAdminRoute } from "../auth/auth.route.admin";

export const adminRoute = new Elysia({ prefix: "/admin" })
  .use(requireRole("Admin"))
  .use(authAdminRoute)
  .use(candidateAdminRoute)
  .use(interviewSlotAdminRoute)
  .use(auditLogAdminRoute);
