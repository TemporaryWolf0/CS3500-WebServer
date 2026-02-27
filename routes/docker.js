import { startServer, stopServer, writeComposeFile, generateServerCompose } from "docker/mcManager.js";
import sqlManager from "../db/sqlManager";
import express from "express";

const router = express.Router();

router.post("/create", async (req, res) => {
  const { name, memory, port, rconPort, type, cfSlug, version } = req.body;

  try {
    const serverId = await sqlManager.createServer({
      name,
      memory,
      port,
      rconPort,
      type,
      cfSlug,
      version
    });

    const config = await sqlManager.getServerConfig(serverId);

    const composePath = writeComposeFile(config);

    await startServer(composePath);

    res.json({ success: true, serverId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create server" });
  }
});
