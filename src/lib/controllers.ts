import { CandidateController } from "../features/candidate/candidate.controller";
import { CandidateService } from "../features/candidate/candidate.service";
import { FormController } from "../features/form/form.controller";
import { FormService } from "../features/form/form.service";
import { InterviewQuestionController } from "../features/interviewQuestion/interviewQuestion.controller";
import { InterviewQuestionService } from "../features/interviewQuestion/interviewQuestion.service";

const formService = new FormService();
const formController = new FormController(formService);
const interviewQuestionServive = new InterviewQuestionService();

const interviewQuestionController = new InterviewQuestionController(
  interviewQuestionServive
);

const candidateService = new CandidateService(
  interviewQuestionController,
  formController
);
const candidateController = new CandidateController(candidateService);

export { formController, interviewQuestionController, candidateController };
