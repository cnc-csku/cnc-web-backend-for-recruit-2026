import { Elysia, t } from 'elysia'
import { AuthModel } from './auth.model'
import { AuthService } from './auth.service'

export const authController = new Elysia({ prefix: '/auth' })