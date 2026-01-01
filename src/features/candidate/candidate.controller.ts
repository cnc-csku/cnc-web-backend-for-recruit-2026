import { Elysia, t } from "elysia";
import { CandidateModel } from "./candidate.model";
import { CandidateService } from "./candidate.service";

export class CandidateController {
  constructor(private service: CandidateService) {}

  async getAllCandidates() {
    this.service;
  }
}
