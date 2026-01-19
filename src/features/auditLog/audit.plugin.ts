import { Elysia } from "elysia";
import { ip } from "elysia-ip";
import { AuditMeta } from "./audit.model";

export const auditPlugin = new Elysia({ name: "meta" })
  .use(ip())
  .derive({ as: "global" }, ({ ip }): { meta: AuditMeta } => ({
    meta: {
      actor: {
        email: "placeHolder",
      },
      ip: ip,
    },
  }));
