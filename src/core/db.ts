import { MongoClient, Db } from 'mongodb'
import { config } from './config'

const uri = config.mongo.uri
const dbName = config.mongo.dbName

if (!uri) {
  throw new Error('MONGO_URI is not defined')
}
if (!dbName) {
  throw new Error('MONGO_DB_NAME is not defined')
}

let client: MongoClient | null = null
let database: Db | null = null

export async function connectToDatabase(): Promise<Db> {
  if (database) return database

  client = new MongoClient(uri)
  await client.connect()
  database = client.db(dbName)

  console.log('[DB] Connected to MongoDB:', dbName)
  return database
}

export async function db() {
  return connectToDatabase()
}
