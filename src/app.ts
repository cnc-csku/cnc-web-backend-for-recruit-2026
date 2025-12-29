import { Elysia } from 'elysia'
import { cors } from "@elysiajs/cors";
import { connectDB } from './core/db';
import { candidateRoute } from './features/candidate/candidate.route'
import { authRoute } from './features/auth/auth.route'

await connectDB()

export const app = new Elysia()
  .use(
    cors({
      origin: ['http://localhost:3000'], // front domain
      credentials: true,
    })
  )
  .get('/health', () => ({ ok: true }))
  .use(authRoute)
  .use(candidateRoute)
  .listen(4000)