import {
  type CreateCandidateBody,
  type Candidate,
  candidatesCol,
  CandidateWithInterviewQuestions,
  InterviewStatusStatic,
  UpdateCandidateBody,
  UpdateCandidateBodySchema,
  CandidateModel,
  ApplicationStatus,
} from "./candidate.model";
import {
  AlreadyHasSlotError,
  AlreadyWithdrawnError,
  CandidateNotFoundError,
  DuplicateCandidateError,
  EditLimitExceededError,
  HasNoSlotError,
} from "../../core/errors";
import { ClientSession, ObjectId, WithId } from "mongodb";
import {
  AddQuestionBody,
  UpdateQuestionBody,
  AddReviewerBody,
  UpdateVoiceBody,
} from "../interviewQuestion/interviewQuestion.model";
import { InterviewQuestionController } from "../interviewQuestion/interviewQuestion.controller";
import { FormController } from "../form/form.controller";
import { AuditLogController } from "../auditLog/audit.controller";
import { AuditMeta } from "../auditLog/audit.model";
import { buildProjection } from "../../utils/buildProjection";
import { AuditUtils } from "../auditLog/audit.utils";
import { InterviewSlotController } from "../InterviewSlot/interviewSlot.controller";
import { pickSafe } from "../../utils/pickSafe";
import { CandidateFileHandler } from "./candidate.file";

const MAX_EDIT_ALLOW = 49;

export class CandidateService {
  constructor(
    private interviewQuestionController: InterviewQuestionController,
    private candidateFileHandler: CandidateFileHandler,
    private formController: FormController,
    private auditController: AuditLogController,
  ) {}

  async getAlls(): Promise<
    Partial<Candidate> &
      { profileImageUrl: string | null; transcriptUrl?: string }[]
  > {
    const candidates = await candidatesCol.find({}).toArray();

    const results = await Promise.all(
      candidates.map(async (c) => {
        const profileImageUrl = c.profileImageKey
          ? this.candidateFileHandler.getUrl(c.profileImageKey)
          : null;

        const transcriptUrl = c.transcriptKey
          ? await this.candidateFileHandler.getPresignedUrl(c.transcriptKey)
          : null;

        return {
          ...c,
          profileImageUrl,
          transcriptUrl,
        };
      }),
    );
    return results;
  }

  async findByEmail(
    email: string,
    withS3: boolean,
  ): Promise<
    | (WithId<Candidate> & {
        profileUrl?: string;
        transcriptUrl?: string;
      })
    | null
  > {
    const candidate = await candidatesCol.findOne({
      email: email,
      applicationStatus: "ACTIVE",
    });

    if (!candidate) return null;

    let transcriptUrl: string | null = null;

    if (withS3) {
      transcriptUrl = candidate.transcriptKey
        ? await this.candidateFileHandler.getPresignedUrl(
            candidate.transcriptKey,
          )
        : null;
    }
    const profileUrl =
      candidate.profileImageKey &&
      (await this.candidateFileHandler.getUrl(candidate.profileImageKey));

    return {
      ...candidate,
      ...(transcriptUrl && { transcriptUrl: transcriptUrl }),
      ...(profileUrl && { profileUrl: profileUrl }),
    };
  }

  //only include interviewquestion when lookup by id
  async findById(
    id: string,
    session?: ClientSession,
  ): Promise<CandidateWithInterviewQuestions> {
    const _id = new ObjectId(id);
    const options = session ? { session } : {};
    const candidate = await candidatesCol.findOne({ _id }, options);

    if (!candidate) throw new CandidateNotFoundError();

    const interviewQ =
      await this.interviewQuestionController.getByCandidateId(id);
    const profileUrl =
      candidate.profileImageKey &&
      (await this.candidateFileHandler.getUrl(candidate.profileImageKey));
    const transcriptUrl = candidate.transcriptKey
      ? await this.candidateFileHandler.getPresignedUrl(candidate.transcriptKey)
      : null;
    return {
      ...candidate,
      interviewQuestions: interviewQ,
      profileImageKey: profileUrl,
      transcriptKey: transcriptUrl,
    };
  }

  async updateCandidate(
    candidateId: string,
    data: Partial<UpdateCandidateBody>,
    isAdmin: boolean = false,
    meta: AuditMeta,
    session?: ClientSession,
  ) {
    if (!isAdmin) await this.formController.assertEditAllowed();
    const exist = await this.findById(candidateId, session);

    if (!exist) throw new CandidateNotFoundError();
    if (exist.editCount >= MAX_EDIT_ALLOW && !isAdmin)
      throw new EditLimitExceededError();

    if (exist.applicationStatus === "WITHDRAWN")
      throw new AlreadyWithdrawnError();

    const _id = new ObjectId(candidateId);

    const before = await candidatesCol.findOne({ _id }, { session });

    const { interviewSlotId, ...rest } = data;
    const safeData = pickSafe(rest, UpdateCandidateBodySchema);

    const result = await candidatesCol.findOneAndUpdate(
      { _id },
      {
        $set: { ...safeData, updatedAt: new Date() },
        $inc: {
          editCount: isAdmin ? 0 : 1,
        },
      },
      { returnDocument: "after", session },
    );

    if (!result) return null;

    const changes = AuditUtils.calculateDiff(before, result);

    this.auditController.audit({
      ...meta,
      action: "EDIT_CANDIDATE",
      changes: {
        before: changes.before,
        after: changes.after,
      },
      target: {
        type: "CANDIDATE",
        id: candidateId,
      },
    });
    return result;
  }

  async updateInterviewStatus(
    candidateId: string,
    status: InterviewStatusStatic,
    meta: AuditMeta,
  ) {
    const exist = await this.findById(candidateId);
    if (!exist) throw new CandidateNotFoundError();

    if (exist.applicationStatus === "WITHDRAWN")
      throw new AlreadyWithdrawnError();

    const _id = new ObjectId(candidateId);

    const before = await candidatesCol.findOne({ _id });

    const result = await candidatesCol.findOneAndUpdate(
      { _id },
      {
        $set: { interviewStatus: status, updatedAt: new Date() },
      },
      { returnDocument: "after" },
    );
    if (!result) return null;

    const changes = AuditUtils.calculateDiff(before, result);

    this.auditController.audit({
      ...meta,
      action: "EDIT_CANDIDATE",
      changes: {
        before: changes.before,
        after: changes.after,
      },
      target: {
        type: "CANDIDATE",
        id: candidateId,
      },
    });
    return result;
  }

  async createCandidate(
    email: string,
    data: CreateCandidateBody,
    meta: AuditMeta,
    session?: ClientSession,
  ) {
    await this.formController.assertSubmissionAllowed();

    const exist = await this.findByEmail(email, false);
    if (exist) throw new DuplicateCandidateError();
    const { interviewSlotId, ...rest } = data;
    const safe = pickSafe(
      rest,
      CandidateModel.candidate,
    ) as CreateCandidateBody;

    const candidate: Candidate = {
      ...safe,
      email,
      transcriptKey: "upload pending",
      profileImageKey: "upload pending",
      currentInterviewRoom: null,
      applicationStatus: "ACTIVE",
      interviewStatus: "PENDING",
      editCount: 0,
      createdAt: new Date(),
      updatedAt: null,
    };
    const result = await candidatesCol.insertOne(candidate, { session });

    this.auditController.audit({
      ...meta,
      action: "SUBMIT_CANDIDATE",
      changes: {
        before: null,
        after: candidate,
      },
      target: {
        type: "CANDIDATE",
        id: result.insertedId.toString(),
      },
    });
    return result;
  }

  async deleteById(id: string, meta: AuditMeta) {
    const _id = new ObjectId(id);
    const result = await candidatesCol.findOneAndDelete(
      { _id },
      {
        projection: {
          fullName: 1,
          email: 1,
        },
      },
    );
    if (!result) return null;

    this.auditController.audit({
      ...meta,
      action: "DELETE_CANDIDATE",
      changes: {
        before: null,
        after: result,
      },
      target: {
        type: "CANDIDATE",
        id: id,
      },
    });
    return result;
  }

  // ─────────────────────────────────────
  // Interview Questions (delegated)
  // ─────────────────────────────────────

  async getInterViewQuestions(id: string) {
    const exist = await this.findById(id);
    if (!exist) throw new CandidateNotFoundError();

    return await this.interviewQuestionController.getByCandidateId(id);
  }

  async initInterViewQuestions(id: string, meta: AuditMeta) {
    const exist = await this.findById(id);
    if (!exist) throw new CandidateNotFoundError();

    return await this.interviewQuestionController.initInterviewDocument(
      id,
      meta,
    );
  }

  async addInterViewQuestion(
    id: string,
    data: AddQuestionBody,
    meta: AuditMeta,
  ) {
    const exist = await this.findById(id);
    if (!exist) throw new CandidateNotFoundError();
    if (exist.applicationStatus === "WITHDRAWN")
      throw new AlreadyWithdrawnError();

    return await this.interviewQuestionController.addQuestion(id, data, meta);
  }

  async updateInterViewQuestion(
    candidateId: string,
    room: "technical" | "attitude",
    index: number,
    data: UpdateQuestionBody,
    meta: AuditMeta,
  ) {
    const exist = await this.findById(candidateId);
    if (!exist) throw new CandidateNotFoundError();
    if (exist.applicationStatus === "WITHDRAWN")
      throw new AlreadyWithdrawnError();

    return await this.interviewQuestionController.updateQuestion(
      candidateId,
      room,
      index,
      data,
      meta,
    );
  }

  async deleteInterViewQuestion(
    candidateId: string,
    room: "technical" | "attitude",
    index: number,
    meta: AuditMeta,
  ) {
    return await this.interviewQuestionController.deleteQuestion(
      candidateId,
      room,
      index,
      meta,
    );
  }

  // ─────────────────────────────────────
  // Reviewers (delegated)
  // ─────────────────────────────────────

  async addInterViewReviewer(
    id: string,
    data: AddReviewerBody,
    meta: AuditMeta,
  ) {
    const exist = await this.findById(id);
    if (!exist) throw new CandidateNotFoundError();

    return await this.interviewQuestionController.addReviewer(id, data, meta);
  }

  // ─────────────────────────────────────
  // Audios / Voice (delegated)
  // ─────────────────────────────────────

  async updateInterViewVoice(
    id: string,
    data: UpdateVoiceBody,
    meta: AuditMeta,
  ) {
    const exist = await this.findById(id);
    if (!exist) throw new CandidateNotFoundError();

    return await this.interviewQuestionController.updateVoice(id, data, meta);
  }

  // ─────────────────────────────────────
  // Interview Slot
  // ─────────────────────────────────────

  async assignInterviewSlot(
    candidateId: string,
    slotId: string,
    session?: ClientSession,
  ) {
    const candidateIdObj = new ObjectId(candidateId);

    const result = await candidatesCol.updateOne(
      {
        _id: candidateIdObj,
        interviewSlotId: { $exists: false },
      },
      {
        $set: { interviewSlotId: slotId },
      },
      session ? { session } : undefined,
    );

    if (result.matchedCount === 0) {
      throw new AlreadyHasSlotError();
    }
  }

  async unAssignInterviewSlot(candidateId: string, session?: ClientSession) {
    const candidateIdObj = new ObjectId(candidateId);

    const result = await candidatesCol.updateOne(
      {
        _id: candidateIdObj,
        interviewSlotId: { $exists: true },
      },
      {
        $unset: { interviewSlotId: "" },
      },
      session ? { session } : undefined,
    );

    if (result.matchedCount === 0) {
      throw new HasNoSlotError();
    }
  }

  async markWithdrawn(candidateId: string, session?: ClientSession) {
    const _id = new ObjectId(candidateId);

    const result = await candidatesCol.updateOne(
      { _id, applicationStatus: { $ne: "WITHDRAWN" } },
      { $set: { applicationStatus: "WITHDRAWN", email: "" } },
      session ? { session } : undefined,
    );

    if (result.matchedCount === 0) {
      throw new Error("Already withdrawn");
    }
  }
}
