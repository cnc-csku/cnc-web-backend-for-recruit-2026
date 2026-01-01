import {
  type CreateCandidateBody,
  type Candidate,
  candidatesCol,
} from "./candidate.model";
import { db } from "../../core/db";

export class CandidateService {
  async getAlls() {
    const result = await candidatesCol.find();
    console.log(result);
  }
}
