import { AuditLogController } from "../features/auditLog/audit.controller";
import { AuditLogService } from "../features/auditLog/audit.service";
import { CandidateController } from "../features/candidate/candidate.controller";
import { CandidateService } from "../features/candidate/candidate.service";
import { CandidateWithdrawalService } from "../features/candidate/candidate.withdraw.service";
import { FormController } from "../features/form/form.controller";
import { FormService } from "../features/form/form.service";
import { InterviewQuestionController } from "../features/interviewQuestion/interviewQuestion.controller";
import { InterviewQuestionService } from "../features/interviewQuestion/interviewQuestion.service";
import { InterviewSlotController } from "../features/InterviewSlot/interviewSlot.controller";
import { InterviewSlotService } from "../features/InterviewSlot/interviewSlot.service";
import { StorageService } from "../features/storage/storage.service";
import { StorageController } from "../features/storage/storage.controller";

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

// Initialize StorageService
const storageService = new StorageService();
const storageController = new StorageController(storageService);

const candidateService = new CandidateService(
  interviewQuestionController,
  formController,
  auditLogController,
  storageController
);
const candidateController = new CandidateController(candidateService);

const interviewSlotService = new InterviewSlotService(
  auditLogController,
  candidateController
);
const interviewSlotController = new InterviewSlotController(
  interviewSlotService
);

const candidateWithdrawalService = new CandidateWithdrawalService(
  candidateController,
  interviewSlotController,
  auditLogController,
  formController
);

export {
  formController,
  interviewQuestionController,
  candidateController,
  interviewSlotController,
  auditLogController,
  candidateWithdrawalService,
  storageController,
  storageService,
};
