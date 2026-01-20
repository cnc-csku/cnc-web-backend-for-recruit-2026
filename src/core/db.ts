import { MongoClient, Db } from "mongodb";
import { config } from "./config";
import { logger } from "./logger";

const uri = config.mongo.uri;
const dbName = config.mongo.dbName;

if (!uri) {
  throw new Error("MONGO_URI is not defined");
}
if (!dbName) {
  throw new Error("MONGO_DB_NAME is not defined");
}

let clientMongo: MongoClient | null = null;
let database: Db | null = null;

export async function connectToDatabase(): Promise<{
  database: Db;
  client: MongoClient;
}> {
  if (database && clientMongo) return { database, client: clientMongo };
  try {
    clientMongo = new MongoClient(uri);

    logger.info("[DB] Connecting to MongoDB uri", uri);
    await clientMongo.connect();

    database = clientMongo.db(dbName);
    logger.info("[DB] ✅ Connected to MongoDB:", dbName);

    clientMongo.on("close", () => {
      logger.error("[DB] MongoDB connection closed");
      database = null;
      clientMongo = null;
    });

    return { database, client: clientMongo };
  } catch (err) {
    logger.error("[DB] Failed to connect to MongoDB");
    console.error(err);
    clientMongo = null;
    database = null;

    throw err;
  }
}

export async function client() {
  return (await connectToDatabase()).client;
}

export async function db() {
  return (await connectToDatabase()).database;
}
