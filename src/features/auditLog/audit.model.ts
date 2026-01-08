import { t } from "elysia";
import { db } from "../../core/db";

export const AuditActions = t.UnionEnum([
  "SUBMIT_CANDIDATE",
  "EDIT_CANDIDATE",
  "DELETE_CANDIDATE",
  "ADD_QUESTION",
  "UPDATE_QUESTION",
  "DELETE_QUESTION",
  "UPDATE_FORM_SCHEDULE",
  "SET_FORM_ALLOW_SUBMIT",
  "ADD_INTERVIEW_SLOT",
  "DELETE_INTERVIEW_SLOT",
  "ADD_CANDIDATE_TO_INTERVIEW_SLOT",
  "REMOVE_CANDIDATE_FROM_INTERVIEW_SLOT",
  "CHANGE_INTERVIEW_SLOT",
]);

export const AuditTargets = t.UnionEnum([
  "CANDIDATE",
  "INTERVIEW_QUESTION",
  "FORM",
  "LOGIN",
  "INTERVIEW_SLOT"
]);

export const AuditLogModel = {
  auditLog: t.Object({
    actor: t.Object({
      userId: t.Nullable(t.String()),
      email: t.String(),
    }),

    action: AuditActions,

    target: t.Object({
      type: AuditTargets,
      id: t.Nullable(t.String()),
    }),

    changes: t.Optional(
      t.Object({
        before: t.Nullable(t.Record(t.String(), t.Unknown())),
        after: t.Nullable(t.Record(t.String(), t.Unknown())),
      })
    ),

    ip: t.String(),
    createdAt: t.Date(),
  }),
  auditMeta: t.Object({
    actor: t.Object({
      userId: t.Nullable(t.String()),
      email: t.String(),
    }),
    ip: t.String(),
  }),
};

export type AuditLog = typeof AuditLogModel.auditLog.static;

export type AuditMeta = typeof AuditLogModel.auditMeta.static;

export const auditLogsCol = (await db()).collection<AuditLog>("audit_logs");
