import { startServer, stopServer, writeComposeFile, generateServerCompose } from "docker/mcManager.js";
import dbManager from "../db/dbManager.js";
import express from "express";

const router = express.Router();

router.post("/create", async (req, res) => {
  const { name, memory, port, rconPort, type, cfSlug, version } = req.body;

  try {
    const serverId = await dbManager.createServer({
      name,
      memory,
      port,
      rconPort,
      type,
      cfSlug,
      version
    });

    const config = await dbManager.getServerConfig(serverId);

    const composePath = writeComposeFile(config);

    await startServer(composePath);

    // If a userId was provided, associate this server with the user
    const userId = req.body.userId || (req.user && req.user.id) || req.query.userId;
    if (userId) {
      try {
        await dbManager.addServerToUser(userId, serverId);
      } catch (e) {
        console.warn("Failed to add server to user", e);
      }
    }

    res.json({ success: true, serverId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create server" });
  }
});
