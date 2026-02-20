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

export class SubmissionEditForbiddenError extends DomainError {
  statusCode = 403;
  code = "SUBMISSION_EDIT_FORBIDDEN";
  constructor(message = "Submission edit is not allow") {
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

export class InterviewSlotNotFoundError extends DomainError {
  statusCode = 404;
  code = "SLOT_NOTFOUND";
  constructor(message = "Interview Slot not found") {
    super(message);
  }
}

export class InterviewSlotFullError extends DomainError {
  statusCode = 403;
  code = "SLOT_FULL";
  constructor(message = "Interview slot is full") {
    super(message);
  }
}

export class InterviewSlotUnavailableError extends DomainError {
  statusCode = 403;
  code = "SLOT_UNVAILABLE";
  constructor(message = "Interview slot is unavailable") {
    super(message);
  }
}

export class AlreadyHasSlotError extends DomainError {
  statusCode = 403;
  code = "CANDIDATE_ALREADY_HAS_SLOT";
  constructor(message = "Candidate already has a slot") {
    super(message);
  }
}

export class HasNoSlotError extends DomainError {
  statusCode = 403;
  code = "CANDIDATE_HAS_NO_SLOT";
  constructor(message = "Candidate has no slot") {
    super(message);
  }
}

export class NotInSlotError extends DomainError {
  statusCode = 403;
  code = "NOT_IN_SLOT";
  constructor(message = "Candidate not in slot") {
    super(message);
  }
}

export class SlotTimeOverlapError extends DomainError {
  statusCode = 403;
  code = "SLOT_TIME_OVERLAP";
  constructor(
    message = "Interview slot with this time is overlap with other slot",
  ) {
    super(message);
  }
}

export class BadTimeSlotError extends DomainError {
  statusCode = 403;
  code = "BAD_TIME_SLOT";
  constructor(message = "Start time must be before end time") {
    super(message);
  }
}

export class AlreadyWithdrawnError extends DomainError {
  statusCode = 403;
  code = "ALREADY_WITHDRAW";
  constructor(message = "Candidate already withdrawn") {
    super(message);
  }
}

export class Unauthorized extends DomainError {
  statusCode = 401;
  code = "UNAUTHORIZED";
  constructor(message = "Unauthorized") {
    super(message);
  }
}

export class Forbidden extends DomainError {
  statusCode = 403;
  code = "FORBIDDEN";
  constructor(message = "Forbidden") {
    super(message);
  }
}

export class UserNotFoundError extends DomainError {
  statusCode = 404;
  code = "USER_NOT_FOUND";
  constructor(message = "Forbidden") {
    super(message);
  }
}

export class FileTooLargeError extends DomainError {
  statusCode = 413;
  code = "FILE_TOO_LARGE";
  constructor(message = "Uploaded file exceeds the maximum allowed size") {
    super(message);
  }
}

export class InvalidFileTypeError extends DomainError {
  statusCode = 415;
  code = "INVALID_FILE_TYPE";
  constructor(message = "File type is not allow") {
    super(message);
  }
}

export class RestrictedError extends DomainError {
  statusCode = 403;
  code = "RESTRICTED";
  constructor(message = "You are restricted for using this system (baned)") {
    super(message);
  }
}

export class NoInterviewRoomError extends DomainError {
  statusCode = 400;
  code = "NO_INTERVIEW_ROOM";
  constructor(message = "Candidate has no interview room assigned") {
    super(message);
  }
}
