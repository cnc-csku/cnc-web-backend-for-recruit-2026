import Elysia from "elysia";
import { InterviewQuestionService } from "../interviewQuestion/interviewQuestion.service";
import { InterviewQuestionController } from "../interviewQuestion/interviewQuestion.controller";
import { CandidateService } from "../candidate/candidate.service";
import { CandidateController } from "../candidate/candidate.controller";
import { InterviewQuestionModel } from "../interviewQuestion/interviewQuestion.model";
import { CandidateModel } from "../candidate/candidate.model";
import { formRoute } from "../form/form.route";
import { candidateAdminRoute } from "../candidate/candidate.route.admin";
import { formAdminRoute } from "../form/form.route.admin";
import { interviewSlotAdminRoute } from "../InterviewSlot/interviewSlot.route.admin";
import { auditLogAdminRoute } from "../auditLog/audit.route.admin";

//TODO: add auth in admin route
export const adminRoute = new Elysia({ prefix: "/admin" })
  .use(candidateAdminRoute)
  .use(interviewSlotAdminRoute)
  .use(formAdminRoute)
  .use(auditLogAdminRoute);
