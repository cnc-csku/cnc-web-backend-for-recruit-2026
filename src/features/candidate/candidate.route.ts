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
    "/profile",
    async ({ candidateController, auth }) => {
      const email = auth.user.email;
      const candidate = await candidateController.getCandidateByEmail(email);

      if (!candidate) {
        throw new CandidateNotFoundError();
      }

      return candidate;
    },
    {
      detail: candidateOpenApi.checkCandidate,
    },
  )
  .put(
    "/profile",
    async ({ body, candidateController, meta, auth }) => {
      const session = (await client()).startSession();
      const uploadedKeys: string[] = [];
      let newProfileKey: string | null = null;
      let newTranscriptKey: string | null = null;
      let oldFiles: (string | null)[] = [];

      const email = auth.user.email;
      try {
        await session.withTransaction(async () => {
          const candidate =
            await candidateController.getCandidateByEmail(email);
          if (!candidate) throw new CandidateNotFoundError();
          const id = candidate._id.toString();

          if (body.profileImage) {
            const profile = await candidateFileHandler.profileUpload(
              body.profileImage,
              id,
            );

            newProfileKey = profile.key;
            oldFiles.push(candidate.profileImageKey);
            uploadedKeys.push(profile.key);
          }

          if (body.transcript) {
            const transcript = await candidateFileHandler.transcriptUpload(
              body.transcript,
              id,
            );
            newTranscriptKey = transcript.key;
            oldFiles.push(candidate.transcriptKey);
            uploadedKeys.push(transcript.key);
          }

          const result = await candidateController.updateCandidateByEmail(
            email,
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
    async ({ body, candidateController, candidateFileHandler, meta, auth }) => {
      const session = (await client()).startSession();
      const uploadedKeys: string[] = [];
      let insertedId: string = "";
      const email = auth.user.email;
      try {
        await session.withTransaction(async () => {
          const result = await candidateController.createCandidate(
            email,
            body,
            meta,
            session,
          );

          if (!result) return;
          insertedId = result.insertedId.toString();

          const transcript = await candidateFileHandler.transcriptUpload(
            body.transcript,
            insertedId,
          );
          uploadedKeys.push(transcript.key);

          const profile = await candidateFileHandler.profileUpload(
            body.profileImage,
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
    "/withdraw",
    async ({
      params,
      auth,
      candidateWithdrawalService,
      candidateController,
      meta,
    }) => {
      const email = auth.user.email;
      const candidate = await candidateController.getCandidateByEmail(email);
      return await candidateWithdrawalService.withdraw(
        candidate?._id.toString(),
        meta,
      );
    },
    { detail: candidateOpenApi.withdrawCandidate },
  )

  //Interview Slot
  // Interview Slot - Assign candidate to a slot
  .post(
    "/interview-slot",
    async ({ params, body, interviewSlotController, meta, auth }) => {
      const email = auth.user.email;
      const candidate = await candidateController.getCandidateByEmail(email);
      return await interviewSlotController.assignCandidateToSlot(
        candidate._id.toString(),
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
    "/interview-slot",
    async ({ params, body, interviewSlotController, meta, auth }) => {
      const email = auth.user.email;
      const candidate = await candidateController.getCandidateByEmail(email);
      return await interviewSlotController.changeCandidateAssignedSlot(
        candidate._id.toString(),
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
    "/interview-slot",
    async ({ params, body, interviewSlotController, meta, auth }) => {
      const email = auth.user.email;
      const candidate = await candidateController.getCandidateByEmail(email);
      return await interviewSlotController.unAssignCandidateFromSlot(
        candidate._id.toString(),
        body.slotId,
        meta,
      );
    },
    {
      body: CandidateModel.unassignSlotBody,
      detail: candidateOpenApi.unassignInterviewSlot,
    },
  );
