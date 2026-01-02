import { AuditLogController } from "../features/auditLog/audit.controller";
import { AuditLogService } from "../features/auditLog/audit.service";
import { CandidateController } from "../features/candidate/candidate.controller";
import { CandidateService } from "../features/candidate/candidate.service";
import { FormController } from "../features/form/form.controller";
import { FormService } from "../features/form/form.service";
import { InterviewQuestionController } from "../features/interviewQuestion/interviewQuestion.controller";
import { InterviewQuestionService } from "../features/interviewQuestion/interviewQuestion.service";

const formService = new FormService();
const formController = new FormController(formService);
const interviewQuestionServive = new InterviewQuestionService();
const auditLogService = new AuditLogService();

const interviewQuestionController = new InterviewQuestionController(
  interviewQuestionServive
);

const candidateService = new CandidateService(
  interviewQuestionController,
  formController
);
const candidateController = new CandidateController(candidateService);
const auditLogController = new AuditLogController(auditLogService);

export {
  formController,
  interviewQuestionController,
  candidateController,
  auditLogController,
};
