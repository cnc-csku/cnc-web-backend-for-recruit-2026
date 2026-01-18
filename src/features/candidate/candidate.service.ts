import {
  type CreateCandidateBody,
  type Candidate,
  candidatesCol,
  CandidateWithInterviewQuestions,
  InterviewStatusStatic,
} from "./candidate.model";
import {
  AlreadyHasSlotError,
  AlreadyWithdrawnError,
  CandidateNotFoundError,
  DuplicateCandidateError,
  EditLimitExceededError,
  HasNoSlotError,
} from "../../core/errors";
import { ClientSession, ObjectId } from "mongodb";
import { CreateInterViewQuestBody } from "../interviewQuestion/interviewQuestion.model";
import { InterviewQuestionController } from "../interviewQuestion/interviewQuestion.controller";
import { FormController } from "../form/form.controller";
import { AuditLogController } from "../auditLog/audit.controller";
import { AuditMeta } from "../auditLog/audit.model";
import { buildProjection } from "../../utils/buildProjection";
import { AuditUtils } from "../auditLog/audit.utils";
import { InterviewSlotController } from "../InterviewSlot/interviewSlot.controller";

const MAX_EDIT_ALLOW = 99999;

export class CandidateService {
  constructor(
    private interviewQuestionController: InterviewQuestionController,
    private formController: FormController,
    private auditController: AuditLogController,
  ) {}

  async getAlls(): Promise<Candidate[]> {
    return await candidatesCol.find({}).toArray();
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    return await candidatesCol.findOne({ email: email });
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
    return { ...candidate, interviewQuestions: interviewQ };
  }

  async updateCandidate(
    candidateId: string,
    data: Partial<CreateCandidateBody>,
    isAdmin: boolean = false,
    meta: AuditMeta,
  ) {
    if (!isAdmin) await this.formController.assertEditAllowed();
    const exist = await this.findById(candidateId);
    if (!exist) throw new CandidateNotFoundError();
    if (exist.editCount >= MAX_EDIT_ALLOW && !isAdmin)
      throw new EditLimitExceededError();

    if (exist.applicationStatus === "WITHDRAWN")
      throw new AlreadyWithdrawnError();

    const _id = new ObjectId(candidateId);

    const before = await candidatesCol.findOne({ _id });

    const { email, ...rest } = data;
    const result = await candidatesCol.findOneAndUpdate(
      { _id },
      {
        $set: { ...rest, updatedAt: new Date() },
        $inc: {
          editCount: isAdmin ? 0 : 1,
        },
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

  async updateUploadedFile(
    candidateId: string,
    profileKey: string,
    transcriptKey: string,
  ) {
    const exist = await this.findById(candidateId);
    if (!exist) throw new CandidateNotFoundError();

    if (exist.applicationStatus === "WITHDRAWN")
      throw new AlreadyWithdrawnError();

    const _id = new ObjectId(candidateId);

    const result = await candidatesCol.findOneAndUpdate(
      { _id },
      {
        $set: {
          profileImageKey: profileKey,
          transcriptKey: transcriptKey,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    );
    if (!result) return null;
    return result;
  }

  async createCandidate(data: CreateCandidateBody, meta: AuditMeta) {
    await this.formController.assertSubmissionAllowed();

    const exist = await this.findByEmail(data.email);
    if (exist) throw new DuplicateCandidateError();
    const { interviewSlotId, ...rest } = data;

    const candidate: Candidate = {
      ...rest,
      transcriptKey: "upload pending",
      profileImageKey: "upload pending",
      currentInterviewRoom: null,
      applicationStatus: "ACTIVE",
      interviewStatus: "PENDING",
      editCount: 0,
      createdAt: new Date(),
      updatedAt: null,
    };
    const result = await candidatesCol.insertOne(candidate);

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

  async getInterViewQuestions(id: string) {
    const exist = await this.findById(id);
    if (!exist) throw new CandidateNotFoundError();

    return await this.interviewQuestionController.getByCandidateId(id);
  }

  async addInterViewQuestion(
    id: string,
    data: Omit<CreateInterViewQuestBody, "candidateId">,
    meta: AuditMeta,
  ) {
    const exist = await this.findById(id);
    if (!exist) throw new CandidateNotFoundError();
    if (exist.applicationStatus === "WITHDRAWN")
      throw new AlreadyWithdrawnError();

    const result =
      await this.interviewQuestionController.createInterViewQuestion(
        id,
        data,
        meta,
      );
    return result;
  }

  async updateInterViewQuestion(
    candidateId: string,
    questionid: string,
    data: Omit<CreateInterViewQuestBody, "candidateId">,
    meta: AuditMeta,
  ) {
    const exist = await this.findById(candidateId);
    if (!exist) throw new CandidateNotFoundError();
    if (exist.applicationStatus === "WITHDRAWN")
      throw new AlreadyWithdrawnError();

    return await this.interviewQuestionController.updateInterViewQuestion(
      questionid,
      data,
      meta,
    );
  }

  async deleteInterViewQuestion(questionId: string, meta: AuditMeta) {
    return await this.interviewQuestionController.deleteQuestionById(
      questionId,
      meta,
    );
  }

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
    await this.formController.assertEditAllowed();
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
