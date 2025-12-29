import { Elysia } from 'elysia'
import { authController } from './features/auth/auth.controller'
import { candidateController } from './features/candidate/candidate.controller'

export const app = new Elysia()
  .use(authController)
  .use(candidateController)