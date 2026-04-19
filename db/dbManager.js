import { MongoClient, ObjectId } from "mongodb";
import bcrypt from "bcrypt";




const url = process.env.MONGO_URL;
if (!url) throw new Error("MONGO_URL is not set - check your environment variables");
const dbName = process.env.DB_NAME || "mcmanager";

let client;
let db;

async function connect() {
  if (!client) {
    console.log('Mongo URL:', url);
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
  await db.collection("users").createIndex({ email: 1 }, { unique: true }).catch(() => {});
}

async function createServer(config) {
  const database = await connect();  const doc = {
    ...config,
    status: "stopped",
    created_at: new Date()
  };
  const res = await database.collection("servers").insertOne(doc);
  return res.insertedId.toString();
}

async function listServers() {
  const database = await connect();
  return database.collection("servers").find({}).toArray();
}

async function updateServerStatus(id, status) {
  const database = await connect();
  const _id = typeof id === "string" ? new ObjectId(id) : id;
  return database.collection("servers").updateOne({ _id }, { $set: { status, updated_at: new Date() } });
}

async function deleteServer(id) {
  const database = await connect();
  const _id = typeof id === "string" ? new ObjectId(id) : id;
  return database.collection("servers").deleteOne({ _id });
}

async function getServerConfig(id) {
  const database = await connect();
  const _id = typeof id === "string" ? new ObjectId(id) : id;
  return database.collection("servers").findOne({ _id });
}

async function getServersByIds(serverIds) {
  const database = await connect();
  const objectIds = serverIds.map(id => typeof id === "string" ? new ObjectId(id) : id);
  return database.collection("servers").find({ _id: { $in: objectIds } }).toArray();
}

async function updateServerConfig(id, fields) {
  const database = await connect();
  const _id = typeof id === "string" ? new ObjectId(id) : id;
  return database.collection("servers").updateOne({ _id }, { $set: { ...fields, updated_at: new Date() } });
}

async function createUser({ name, email, phone = '', password, role = 'public', username }) {
  if (!name || !email || !password) throw new Error('name, email and password required');
  const database = await connect();
  const hash = await bcrypt.hash(password, 10);
  const doc = {
    name,
    email,
    username: username || name,
    phone,
    role,
    password: hash,
    serversGuid: [],
    created_at: new Date(),
    updated_at: new Date()
  };
  const res = await database.collection("users").insertOne(doc);
  return { id: res.insertedId.toString(), ...doc };
}

async function verifyPassword(user, password) {
  if (!user || !user.password) return false;
  return bcrypt.compare(password, user.password);
}

async function getUserByUsername(username) {
  const database = await connect();
  return database.collection("users").findOne({ username });
}

async function getUserByEmail(email) {
  const database = await connect();
  return database.collection("users").findOne({ email });
}

async function getUserById(id) {
  const database = await connect();
  const _id = typeof id === "string" ? new ObjectId(id) : id;
  return database.collection("users").findOne({ _id });
}
async function removeUser(userid, email) {
  const database = await connect();
  return database.collection("users").deleteOne({ _id: new ObjectId(userid) });
}
async function updateUser(username, updateFields) {
  const database = await connect();
  return database.collection("users").updateOne({ username }, { $set: updateFields });
}
async function findUser(username, email) {
  const database = await connect();
  return database.collection("users").findOne({ username, email });
}

async function addServerToUser(userId, serverId) {
  const database = await connect();
  const _id = typeof userId === "string" ? new ObjectId(userId) : userId;
  const sid = typeof serverId === "string" ? serverId : serverId.toString();
  await database.collection("users").updateOne({ _id }, { $addToSet: { serversGuid: sid } });
  return true;
}

async function getUserList() {
  const database = await connect();
  return await database.collection("users").find(
    {},
    {
      projection: {
        username: 1,
        email: 1,
        name: 1,
        role: 1
      }
    }
  ).toArray();
}
export default {
  connect,
  init,
  createServer,
  getServerConfig,
  createUser,
  getUserByUsername,
  getUserByEmail,
  getUserById,
  verifyPassword,
  getUserList,
  findUser,
  removeUser,
  updateUser,
  listServers,
  updateServerStatus,
  deleteServer,
  getServersByIds,
  updateServerConfig,
  addServerToUser
};