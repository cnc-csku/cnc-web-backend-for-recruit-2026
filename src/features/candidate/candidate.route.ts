import { Elysia, t } from "elysia";
import { CandidateModel } from "./candidate.model";
import {
  candidateController,
  candidateFileHandler,
  candidateWithdrawalService,
  interviewSlotController,
  storageController,
} from "../../lib/controllers";
import { auditPlugin } from "../auditLog/audit.plugin";
import { candidateOpenApi } from "./candidate.openapi";
import { client } from "../../core/db";
import { CandidateNotFoundError } from "../../core/errors";
import { authGuard } from "../auth/auth.guard";

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
      const result = await candidateController.getCandidateByEmail(
        email,
        false,
      );

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
      const candidate = await candidateController.getCandidateByEmail(
        email,
        true,
      );

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
      let uploadedTranscript: string | null = null;
      let uploadedProfile: string | null = null;
      let oldTranscript: string | null = null;
      let oldProfile: string | null = null;

      let id: string = "";

      const email = auth.user.email;
      try {
        const candidate = await candidateController.getCandidateByEmail(
          email,
          false,
        );
        if (!candidate) throw new CandidateNotFoundError();
        id = candidate._id.toString();

        oldProfile = candidate.profileImageKey || null;
        oldTranscript = candidate.transcriptKey || null;

        if (body.profileImage) {
          const profile = await candidateFileHandler.profileUpload(
            body.profileImage,
            id,
          );

          uploadedProfile = profile.key;
        }

        if (body.transcript) {
          const transcript = await candidateFileHandler.transcriptUpload(
            body.transcript,
            id,
          );
          uploadedTranscript = transcript.key;
        }

        const result = await candidateController.updateCandidateByEmail(
          email,
          {
            ...body,
            ...(uploadedProfile && { profileImageKey: uploadedProfile }),
            ...(uploadedTranscript && { transcriptKey: uploadedTranscript }),
          },
          false,
          meta,
        );
        if (!result) return;

        if (oldProfile && uploadedProfile)
          await candidateFileHandler.unlinkProfile(oldProfile);

        if (oldTranscript && uploadedTranscript)
          await candidateFileHandler.unlinkTranscript(oldTranscript);

        return { ok: true };
      } catch (err) {
        if (uploadedProfile)
          await candidateFileHandler.unlinkProfile(uploadedProfile);

        if (uploadedTranscript)
          await candidateFileHandler.unlinkTranscript(uploadedTranscript);
        throw err;
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
      let uploadedTranscript: string | null = null;
      let uploadedProfile: string | null = null;
      let insertedId: string = "";
      const email = auth.user.email;
      try {
        const result = await candidateController.createCandidate(
          email,
          body,
          meta,
        );
        if (!result) throw new Error("Failed to create candidate");
        insertedId = result.insertedId.toString();

        const transcript = await candidateFileHandler.transcriptUpload(
          body.transcript,
          insertedId,
        );
        uploadedTranscript = transcript.key;

        const profile = await candidateFileHandler.profileUpload(
          body.profileImage,
          insertedId,
        );
        uploadedProfile = profile.key;
        await candidateController.updateCandidate(
          insertedId,
          {
            profileImageKey: profile.key,
            transcriptKey: transcript.key,
          },
          true,
          meta,
        );

        return { insertedId };
      } catch (err) {
        if (uploadedProfile)
          await candidateFileHandler.unlinkProfile(uploadedProfile);

        if (uploadedTranscript)
          await candidateFileHandler.unlinkTranscript(uploadedTranscript);

        if (insertedId) {
          await candidateController.deleteCandidate(insertedId, meta);
        }

        throw err;
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
      const candidate = await candidateController.getCandidateByEmail(
        email,
        false,
      );
      if (!candidate) throw new CandidateNotFoundError();
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
      const candidate = await candidateController.getCandidateByEmail(
        email,
        false,
      );
      if (!candidate) throw new CandidateNotFoundError();
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
      const candidate = await candidateController.getCandidateByEmail(
        email,
        false,
      );
      if (!candidate) throw new CandidateNotFoundError();
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
      const candidate = await candidateController.getCandidateByEmail(
        email,
        false,
      );
      if (!candidate) throw new CandidateNotFoundError();
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
