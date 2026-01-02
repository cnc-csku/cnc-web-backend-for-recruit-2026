import { MongoClient, Db } from "mongodb";
import { config } from "./config";

const uri = config.mongo.uri;
const dbName = config.mongo.dbName;

if (!uri) {
  throw new Error("MONGO_URI is not defined");
}
if (!dbName) {
  throw new Error("MONGO_DB_NAME is not defined");
}

let client: MongoClient | null = null;
let database: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (database) return database;

  try {
    client = new MongoClient(uri);

    console.log("[DB] Connecting to MongoDB...");
    await client.connect();

    database = client.db(dbName);
    console.log("[DB] Connected to MongoDB:", dbName);

    client.on("close", () => {
      console.error("[DB] MongoDB connection closed");
      database = null;
      client = null;
    });

    return database;
  } catch (err) {
    console.error("[DB] Failed to connect to MongoDB");
    console.error(err);
    client = null;
    database = null;

    throw err;
  }
}

export async function db() {
  return connectToDatabase();
}
