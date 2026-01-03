import { AuditLogController } from "../features/auditLog/audit.controller";
import { AuditLogService } from "../features/auditLog/audit.service";
import { CandidateController } from "../features/candidate/candidate.controller";
import { CandidateService } from "../features/candidate/candidate.service";
import { FormController } from "../features/form/form.controller";
import { FormService } from "../features/form/form.service";
import { InterviewQuestionController } from "../features/interviewQuestion/interviewQuestion.controller";
import { InterviewQuestionService } from "../features/interviewQuestion/interviewQuestion.service";

const auditLogService = new AuditLogService();
const auditLogController = new AuditLogController(auditLogService);

const formService = new FormService(auditLogController);
const formController = new FormController(formService);

const interviewQuestionServive = new InterviewQuestionService(
  auditLogController
);

const interviewQuestionController = new InterviewQuestionController(
  interviewQuestionServive
);

const candidateService = new CandidateService(
  interviewQuestionController,
  formController,
  auditLogController
);
const candidateController = new CandidateController(candidateService);

export {
  formController,
  interviewQuestionController,
  candidateController,
  auditLogController,
};
