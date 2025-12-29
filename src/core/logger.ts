import { config } from './config'

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

class Logger {
  constructor(private context?: string) {}

  private fmt(level: LogLevel, msg: string, meta?: unknown) {
    const prefix = this.context ? `[${this.context}]` : ''
    const base = `${new Date().toISOString()} ${level.toUpperCase()} ${prefix} ${msg}`
    return meta ? `${base} ${JSON.stringify(meta)}` : base
  }

  debug(msg: string, meta?: unknown) {
    if (!config.isDev) return
    console.debug(this.fmt('debug', msg, meta))
  }

  info(msg: string, meta?: unknown) {
    console.info(this.fmt('info', msg, meta))
  }

  warn(msg: string, meta?: unknown) {
    console.warn(this.fmt('warn', msg, meta))
  }

  error(msg: string, meta?: unknown) {
    console.error(this.fmt('error', msg, meta))
  }

  withContext(context: string) {
    return new Logger(context)
  }
}

export const logger = new Logger()
