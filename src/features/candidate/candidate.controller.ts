import { Elysia, t } from 'elysia'
import { CandidateModel } from './candidate.model'
import { CandidateService } from './candidate.service'

export const candidateController = new Elysia({ prefix: '/candidates' })