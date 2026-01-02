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
  "LOGIN",
]);

export const AuditTargets = t.UnionEnum([
  "CANDIDATE",
  "INTERVIEW_QUESTION",
  "FORM",
  "LOGIN",
]);

export const AuditLogModel = {
  auditLog: t.Object({
    actor: t.Object({
      userId: t.Nullable(t.String()),
      role: t.String(),
    }),

    action: AuditActions,

    target: t.Object({
      type: AuditTargets,
      id: t.Nullable(t.String()),
    }),

    changes: t.Optional(
      t.Object({
        before: t.Record(t.String(), t.Unknown()),
        after: t.Record(t.String(), t.Unknown()),
      })
    ),

    ip: t.String(),
    createdAt: t.Date(),
  }),
};

export type AuditLog = typeof AuditLogModel.auditLog.static;

export const auditLogsCol = (await db()).collection<AuditLog>("audit_logs");
