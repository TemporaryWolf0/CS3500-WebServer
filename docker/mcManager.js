import path from "path";
import fs from "fs";
import { exec } from "child_process";

export function startServer(composePath) {
  return new Promise((resolve, reject) => {
    exec(`docker compose -f ${composePath} up -d`, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve(stdout);
    });
  });
}

export function stopServer(composePath) {
  return new Promise((resolve, reject) => {
    exec(`docker compose -f ${composePath} down`, (err, stdout, stderr) => {
      if (err) return reject(stderr);
      resolve(stdout);
    });
  });
}



export function writeComposeFile(config) {
  const folder = path.join("servers", `server${config.id}`);
  const filePath = path.join(folder, "docker-compose.yml");

  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(filePath, generateServerCompose(config));

  return filePath;
}



export function generateServerCompose(config) {
  const {
    id,
    name,
    memory,
    port,
    rconPort,
    type,
    cfSlug,
    version,
    dataPath
  } = config;

  const yaml = `
version: "3.9"

services:
  mc_server_${id}:
    image: itzg/minecraft-server
    container_name: mc_server_${id}
    environment:
      EULA: "TRUE"
      MEMORY: "${memory}"
      TYPE: "${type}"
      VERSION: "${version}"
      CF_SLUG: "${cfSlug}"
      ENABLE_RCON: "true"
      RCON_PORT: "${rconPort}"
    ports:
      - "${port}:${port}"
      - "${rconPort}:${rconPort}"
    volumes:
      - ${dataPath}:/data
    restart: unless-stopped
    networks:
      - mcnet

networks:
  mcnet:
    external: true
`;

  return yaml;
}

