import { MongoClient, Db } from "mongodb";

const uri = process.env.MONGODB_URI! || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB!;

const client = new MongoClient(uri);

let _db: Db | null = null;

export async function connectDB() {
  console.log("contecting");

  if (!_db) {
    await client.connect();
    _db = client.db(dbName);
  }
  return _db;
}

export function db(): Db {
  if (!_db) throw new Error("DB not connected. Call connectDB() first.");
  return _db;
}
