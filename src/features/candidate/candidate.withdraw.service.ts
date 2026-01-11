import { ObjectId } from "mongodb";
import { client } from "../../core/db";
import { AuditLogController } from "../auditLog/audit.controller";
import { AuditMeta } from "../auditLog/audit.model";
import { InterviewSlotService } from "../InterviewSlot/interviewSlot.service";
import { candidatesCol } from "./candidate.model";
import { CandidateService } from "./candidate.service";
import { FormController } from "../form/form.controller";
import { CandidateController } from "./candidate.controller";
import { InterviewSlotController } from "../InterviewSlot/interviewSlot.controller";
import { AlreadyWithdrawnError } from "../../core/errors";

export class CandidateWithdrawalService {
  constructor(
    private candidateController: CandidateController,
    private interviewSlotController: InterviewSlotController,
    private auditController: AuditLogController,
    private formController: FormController
  ) {}

  async withdraw(candidateId: string, meta: AuditMeta) {
    const session = (await client()).startSession();
    await this.formController.assertEditAllowed();
    try {
      const result = await session.withTransaction(async () => {
        const candidate = await this.candidateController.getCandidate(
          candidateId,
          session
        );

        if (candidate.applicationStatus === "WITHDRAWN") {
          throw new AlreadyWithdrawnError();
        }

        // 1. unassign slot if exists
        if (candidate.interviewSlotId) {
          await this.interviewSlotController.unAssignCandidateFromSlot(
            candidateId,
            candidate.interviewSlotId,
            meta
          );
        }

        await this.candidateController.markWithdrawn(candidateId, session);

        return candidate;
      });

      this.auditController.audit({
        ...meta,
        action: "WITHDRAW_CANDIDATE",
        target: {
          type: "CANDIDATE",
          id: candidateId,
        },
        changes: {
          before: { applicationStatus: "ACTIVE" },
          after: { applicationStatus: "WITHDRAWN" },
        },
      });

      return result;
    } finally {
      await session.endSession();
    }
  }
}
