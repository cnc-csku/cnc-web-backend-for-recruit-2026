import { Elysia } from 'elysia'
import { jwt } from '@elysiajs/jwt'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

const authService = new AuthService({
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
})

const authController = new AuthController(authService)

export const authRoute = new Elysia({ prefix: '/auth' })
  .use(
    jwt({
      name: 'jwt',
      secret: process.env.JWT_SECRET!
    })
  )
  .decorate('authService', authService)
  .decorate('authController', authController)
  .post('/google', async ({ body, jwt, set, authController }) => {
    try {
      const result = await authController.googleLogin(body, (p) => jwt.sign(p))
      return result
    } catch (err: any) {
      console.error("AUTH /google error:", err);
      set.status = 401
      return {
        error: 'UNAUTHORIZED',
        message: err?.message ?? 'Login failed',
      }
    }
  })
