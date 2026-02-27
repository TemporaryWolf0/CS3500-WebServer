import fs from "fs";
import path from "path";
import { generateServerCompose } from "./generateCompose.js";

export function writeComposeFile(config) {
  const folder = path.join("servers", `server${config.id}`);
  const filePath = path.join(folder, "docker-compose.yml");

  fs.mkdirSync(folder, { recursive: true });
  fs.writeFileSync(filePath, generateServerCompose(config));

  return filePath;
}