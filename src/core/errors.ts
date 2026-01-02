export abstract class DomainError extends Error {
  abstract statusCode: number;
  abstract code: string;
  constructor(message: string) {
    super(message);
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class DuplicateCandidateError extends DomainError {
  statusCode = 409;
  code = "DUPLICATE_CANDIDATE";
  constructor(message = "Candidate already exists") {
    super(message);
  }
}

export class CandidateNotFoundError extends DomainError {
  statusCode = 404;
  code = "CANDIDATE_NOTFOUND";
  constructor(message = "Candidate already exists") {
    super(message);
  }
}

export class EditLimitExceededError extends DomainError {
  statusCode = 403;
  code = "EDIT_LIMIT_EXCEED";
  constructor(message = "Edit limit exceeded") {
    super(message);
  }
}
