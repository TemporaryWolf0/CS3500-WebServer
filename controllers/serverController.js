import db from "../db/dbManager.js";
import Dockerode from "dockerode";

const docker = new Dockerode();

const CONTAINER_PREFIX = "mc-";

function containerName(serverId) {
  return `${CONTAINER_PREFIX}${serverId}`;
}
async function getContainer(serverId) {
  return docker.getContainer(containerName(serverId));
}

export async function createServer(userId, config) {

  const serverId = await db.createServer({
    name: config.name,
    port: config.port,
    memory: config.memory ?? "2G",
    version: config.version ?? "LATEST",
    type: config.type ?? "VANILLA",
    ownerId: userId,
  });


  await docker.createContainer({
    Image: "itzg/minecraft-server",
    name: containerName(serverId),
    Env: [
      "EULA=TRUE",
      `MEMORY=${config.memory ?? "2G"}`,
      `VERSION=${config.version ?? "LATEST"}`,
      `TYPE=${config.type ?? "VANILLA"}`,
    ],
    ExposedPorts: { "25565/tcp": {} },
    HostConfig: {
      PortBindings: {
        "25565/tcp": [{ HostPort: config.port.toString() }],
      },
      Binds: [`mc_data_${serverId}:/data`],
    },
  });

  await db.addServerToUser(userId, serverId);

  return serverId;
}

export async function startServer(userId, serverId) {
  await assertOwnership(userId, serverId);
  const container = await getContainer(serverId);
  await container.start();
  await db.updateServerStatus(serverId, "running");
}

export async function stopServer(userId, serverId) {
  await assertOwnership(userId, serverId);
  const container = await getContainer(serverId);
  await container.stop();
  await db.updateServerStatus(serverId, "stopped");
}

export async function deleteServer(userId, serverId) {
  await assertOwnership(userId, serverId);

  const container = await getContainer(serverId);

  try {
    await container.stop();
  } catch (e) {}


  await container.remove();

  try {
    const volume = docker.getVolume(`mc_data_${serverId}`);
    await volume.remove();
  } catch (e) {}

  await db.deleteServer(serverId);
}

export async function getUserServers(userId) {
  const user = await db.getUserById(userId);
  if (!user || !user.serversGuid?.length) return [];

  const servers = await db.getServersByIds(user.serversGuid);

  return Promise.all(
    servers.map(async (server) => {
      let dockerStatus = "unknown";
      try {
        const container = await getContainer(server._id.toString());
        const info = await container.inspect();
        dockerStatus = info.State.Status; 
      } catch (e) {
        dockerStatus = "not_found";
      }
      return { ...server, dockerStatus };
    })
  );
}

async function assertOwnership(userId, serverId) {
  const server = await db.getServerConfig(serverId);
  if (!server) throw new Error("Server not found");
  if (server.ownerId.toString() !== userId.toString()) {
    throw new Error("Unauthorized: you do not own this server");
  }
}


