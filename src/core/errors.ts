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
  constructor(message = "Candidate not found") {
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

export class FormConfigError extends DomainError {
  statusCode = 404;
  code = "FORM_CONFIG_NOT_SET";
  constructor(message = "Form config not set") {
    super(message);
  }
}

export class SubmissionDisabledError extends DomainError {
  statusCode = 403;
  code = "SUBMISSION_DISABLED";
  constructor(message = "Submission has beed temporary disabled") {
    super(message);
  }
}

export class SubmissionWindowClosedError extends DomainError {
  statusCode = 403;
  code = "SUBMISSION_WINDOW_CLOSE";
  constructor(message = "Submission is not allowed at this time") {
    super(message);
  }
}

export class ScheduleNotFoundError extends DomainError {
  statusCode = 404;
  code = "SCHEDULE_NOTFOUND";
  constructor(message = "Schedule not set") {
    super(message);
  }
}
