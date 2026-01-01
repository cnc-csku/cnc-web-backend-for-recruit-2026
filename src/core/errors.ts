export class DuplicateCandidateError extends Error {
  constructor(message = "Duplicate candidate") {
    super(message);
    this.name = "DUP_CANDIDATE";
  }
}
