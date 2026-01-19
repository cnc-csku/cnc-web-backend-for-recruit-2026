import { StorageController } from "../core/storage/storage.controller";
import { StorageService } from "../core/storage/storage.service";
import { AuditLogController } from "../features/auditLog/audit.controller";
import { AuditLogService } from "../features/auditLog/audit.service";
import { CandidateController } from "../features/candidate/candidate.controller";
import { CandidateFileHandler } from "../features/candidate/candidate.file";
import { CandidateService } from "../features/candidate/candidate.service";
import { CandidateWithdrawalService } from "../features/candidate/candidate.withdraw.service";
import { FormController } from "../features/form/form.controller";
import { FormService } from "../features/form/form.service";
import { InterviewQuestionController } from "../features/interviewQuestion/interviewQuestion.controller";
import { InterviewQuestionService } from "../features/interviewQuestion/interviewQuestion.service";
import { InterviewSlotController } from "../features/InterviewSlot/interviewSlot.controller";
import { InterviewSlotService } from "../features/InterviewSlot/interviewSlot.service";

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

const storageService = new StorageService();
const storageController = new StorageController(storageService);
const candidateFileHandler = new CandidateFileHandler(storageController);

const candidateService = new CandidateService(
  interviewQuestionController,
  candidateFileHandler,
  formController,
  auditLogController
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
  candidateFileHandler,
};
