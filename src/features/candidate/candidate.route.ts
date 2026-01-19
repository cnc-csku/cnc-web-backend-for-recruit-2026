import { Elysia, t } from "elysia";
import { CandidateModel } from "./candidate.model";
import {
  candidateController,
  candidateFileHandler,
  candidateWithdrawalService,
  interviewSlotController,
  storageController,
} from "../../lib/controllers";
import { ip } from "elysia-ip";
import { auditPlugin } from "../auditLog/audit.plugin";
import { candidateOpenApi } from "./candidate.openapi";
import { client } from "../../core/db";
import { CandidateNotFoundError } from "../../core/errors";
import { authGuard } from "../auth/auth.guard";

//TODO: get profile from auth
//TODO: Middleware rate limit

export const candidateRoute = new Elysia({ prefix: "/candidates" })
  .use(auditPlugin)
  .use(authGuard)
  .decorate("candidateController", candidateController)
  .decorate("interviewSlotController", interviewSlotController)
  .decorate("candidateWithdrawalService", candidateWithdrawalService)
  .decorate("candidateFileHandler", candidateFileHandler)
  .decorate("storageController", storageController)
  .get(
    "/check",
    async ({ candidateController, auth }) => {
      const email = auth.user.email;
      const result = await candidateController.getCandidateByEmail(email);

      return { submitted: result !== null, candidateId: result?._id };
    },
    {
      detail: candidateOpenApi.checkCandidate,
    },
  )
  .get(
    "/:candidateId",
    async ({ params, candidateController }) => {
      return await candidateController.getCandidate(params.candidateId);
    },
    {
      detail: candidateOpenApi.getCandidate,
    },
  )
  .put(
    "/:id",
    async ({ params, body, candidateController, meta }) => {
      const session = (await client()).startSession();
      const uploadedKeys: string[] = [];
      let newProfileKey: string | null = null;
      let newTranscriptKey: string | null = null;
      let oldFiles: (string | null)[] = [];

      const id = params.id;
      try {
        await session.withTransaction(async () => {
          const candidate = await candidateController.getCandidate(id, session);
          if (!candidate) throw new CandidateNotFoundError();

          if (body.profileImageFile) {
            const profile = await candidateFileHandler.profileUpload(
              body.profileImageFile,
              id,
            );

            newProfileKey = profile.key;
            oldFiles.push(candidate.profileImageKey);
            uploadedKeys.push(profile.key);
          }

          if (body.transcriptFile) {
            const transcript = await candidateFileHandler.transcriptUpload(
              body.transcriptFile,
              id,
            );
            newTranscriptKey = transcript.key;
            oldFiles.push(candidate.transcriptKey);
            uploadedKeys.push(transcript.key);
          }

          const result = await candidateController.updateCandidate(
            id,
            {
              ...body,
              ...(newProfileKey && { profileImageKey: newProfileKey }),
              ...(newTranscriptKey && { transcriptKey: newTranscriptKey }),
            },
            false,
            meta,
            session,
          );
          if (!result) return;
        });
        await Promise.all(
          oldFiles
            .filter((v) => v !== null)
            .map((k) => candidateFileHandler.unlink(k)),
        );

        return { ok: true };
      } catch (err) {
        await Promise.all(
          uploadedKeys.map((key) => candidateFileHandler.unlink(key)),
        );
        throw err;
      } finally {
        await session.endSession();
      }
    },
    {
      body: t.Partial(CandidateModel.createCandidateBody),
      detail: candidateOpenApi.updateCandidate,
    },
  )
  .post(
    "/submit",
    async ({ body, candidateController, candidateFileHandler, meta }) => {
      const session = (await client()).startSession();
      const uploadedKeys: string[] = [];
      let insertedId: string = "";
      try {
        await session.withTransaction(async () => {
          const result = await candidateController.createCandidate(
            body,
            meta,
            session,
          );

          if (!result) return;
          insertedId = result.insertedId.toString();

          const transcript = await candidateFileHandler.transcriptUpload(
            body.transcriptFile,
            insertedId,
          );
          uploadedKeys.push(transcript.key);

          const profile = await candidateFileHandler.profileUpload(
            body.profileImageFile,
            insertedId,
          );
          uploadedKeys.push(profile.key);

          await candidateController.updateCandidate(
            insertedId,
            {
              profileImageKey: profile.key,
              transcriptKey: transcript.key,
            },
            true,
            meta,
            session,
          );
        });
        return { insertedId };
      } catch (err) {
        await Promise.all(
          uploadedKeys.map((key) => candidateFileHandler.unlink(key)),
        );
        throw err;
      } finally {
        await session.endSession();
      }
    },
    {
      body: CandidateModel.createCandidateBody,
      detail: candidateOpenApi.createCandidate,
    },
  )
  .delete(
    "/:candidateId",
    async ({ params, meta }) => {
      return await candidateController.deleteCandidate(
        params.candidateId,
        meta,
      );
    },
    { detail: candidateOpenApi.deleteCandidate },
  )
  .post(
    "/:candidateId/withdraw",
    async ({ params, body, candidateWithdrawalService, meta }) => {
      return await candidateWithdrawalService.withdraw(
        params.candidateId,
        meta,
      );
    },
    { detail: candidateOpenApi.withdrawCandidate },
  )

  //Interview Slot
  // Interview Slot - Assign candidate to a slot
  .post(
    "/:candidateId/interview-slot",
    async ({ params, body, interviewSlotController, meta }) => {
      return await interviewSlotController.assignCandidateToSlot(
        params.candidateId,
        body.slotId,
        meta,
      );
    },
    {
      body: CandidateModel.assignSlotBody,
      detail: candidateOpenApi.assignInterviewSlot,
    },
  )
  // Interview Slot - Change selected slot
  .patch(
    "/:candidateId/interview-slot",
    async ({ params, body, interviewSlotController, meta }) => {
      return await interviewSlotController.changeCandidateAssignedSlot(
        params.candidateId,
        body.slotId,
        meta,
      );
    },
    {
      body: CandidateModel.assignSlotBody,
      detail: candidateOpenApi.changeInterviewSlot,
    },
  )
  // Interview Slot - Unassign candidate from a slot
  .delete(
    "/:candidateId/interview-slot",
    async ({ params, body, interviewSlotController, meta }) => {
      return await interviewSlotController.unAssignCandidateFromSlot(
        params.candidateId,
        body.slotId,
        meta,
      );
    },
    {
      body: CandidateModel.unassignSlotBody,
      detail: candidateOpenApi.unassignInterviewSlot,
    },
  );
