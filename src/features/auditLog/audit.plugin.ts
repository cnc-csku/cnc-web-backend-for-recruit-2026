import { Elysia } from "elysia";
import { ip } from "elysia-ip";
import { AuditMeta } from "./audit.model";
import { authGuard } from "../auth/auth.guard";

export const auditPlugin = new Elysia({ name: "meta" })
  .use(ip())
  .use(authGuard)
  .derive({ as: "global" }, ({ ip, auth }): { meta: AuditMeta } => ({
    meta: {
      actor: {
        email: auth.user.email,
      },
      ip: ip,
    },
  }));
