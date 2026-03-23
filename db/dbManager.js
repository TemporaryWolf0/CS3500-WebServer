import { MongoClient, ObjectId } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcrypt";

dotenv.config();

const url = process.env.MONGO_URL || process.env.DATABASE_URL || "mongodb://localhost:27017";
const dbName = process.env.DB_NAME || "mcmanager";

let client;
let db;

async function connect() {
  if (!client) {
    client = new MongoClient(url);
    await client.connect();
    db = client.db(dbName);
  }
  return db;
}

async function init() {
  await connect();
  try {
    await db.createCollection("servers");
  } catch (e) {}
  try {
    await db.createCollection("users");
  } catch (e) {}
  await db.collection("users").createIndex({ username: 1 }, { unique: true }).catch(() => {});
}

async function createServer(config) {
  const database = await connect();
  const doc = {
    ...config,
    status: "stopped",
    created_at: new Date()
  };
  const res = await database.collection("servers").insertOne(doc);
  return res.insertedId.toString();
}

async function getServerConfig(id) {
  const database = await connect();
  const _id = typeof id === "string" ? new ObjectId(id) : id;
  return database.collection("servers").findOne({ _id });
}

async function createUser({ username, password, permissions = 10 }) {
  const database = await connect();
  const hash = await bcrypt.hash(password, 10);
  const res = await database.collection("users").insertOne({ username, password: hash, permissions, serversGuid: [], created_at: new Date() });
  return res.insertedId.toString();
}

async function getUserByUsername(username) {
  const database = await connect();
  return database.collection("users").findOne({ username });
}

async function getUserById(id) {
  const database = await connect();
  const _id = typeof id === "string" ? new ObjectId(id) : id;
  return database.collection("users").findOne({ _id });
}

async function addServerToUser(userId, serverId) {
  const database = await connect();
  const _id = typeof userId === "string" ? new ObjectId(userId) : userId;
  // Ensure serverId is stored as string
  const sid = typeof serverId === "string" ? serverId : serverId.toString();
  await database.collection("users").updateOne({ _id }, { $addToSet: { serversGuid: sid } });
  return true;
}

export default {
  connect,
  init,
  createServer,
  getServerConfig,
  createUser,
  getUserByUsername
};