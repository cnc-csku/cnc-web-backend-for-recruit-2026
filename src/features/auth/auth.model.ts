import { t } from 'elysia'

export const AuthModel = {
    auth: t.Object({

    })
}

export type Auth = typeof AuthModel.auth.static