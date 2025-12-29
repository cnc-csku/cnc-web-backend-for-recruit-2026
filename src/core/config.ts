type NodeEnv = 'development' | 'production' | 'test'

const NODE_ENV = (process.env.NODE_ENV || 'development') as NodeEnv

export const config = {
  env: NODE_ENV,
  isDev: NODE_ENV === 'development',
  isProd: NODE_ENV === 'production',

  port: Number(process.env.PORT || 3000),

  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://mongo:27017/cnc-recruit-2026',
    dbName: process.env.MONGO_DB_NAME || 'cnc-recruit-2026'
  }
}

if (!config.mongo.uri) {
  throw new Error('MONGO_URI is required')
}
