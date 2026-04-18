import express from "express";
import path from "path";
import fs from "fs";
import * as serverController from "../controllers/serverController.js";

const router = express.Router();

// Middleware to ensure user is admin
function ensureModMin(req, res, next) {
  if (req.isAuthenticated() && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    return next();
  }
  return res.redirect('/pages/dashboard');
}

router.use(ensureModMin);

router.get("/server-dashboard", async (req, res) => {
  try {
    const servers = await serverController.getUserServers(req.user.id);
    res.render("layout", {
      title: "Server Dashboard",
      active: "server-dashboard",
      content: "moderator/server-dashboard.ejs",
      servers,
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Error loading servers");
  }
});

router.post("/servers/create", async (req, res) => {
  try {
    const { name, port, memory, version, type } = req.body;
 
    if (!name) return res.status(400).send("Server name is required");
    if (!port) return res.status(400).send("Port is required");
 
    await serverController.createServer(req.user.id, {
      name,
      port: parseInt(port, 10),
      memory: memory || "2G",
      version: version || "LATEST",
      type: type || "VANILLA",
    });
 
    res.redirect("/moderator/server-dashboard");
  } catch (e) {
    console.error(e);
    res.status(500).send("Error creating server: " + e.message);
  }
});

router.post("/servers/:id/start", async (req, res) => {
  try {
    await serverController.startServer(req.user.id, req.params.id);
    res.redirect("/moderator/server-dashboard");
  } catch (e) {
    console.error(e);
    const status = e.message.startsWith("Unauthorized") ? 403 : 500;
    res.status(status).send("Error starting server: " + e.message);
  }
});

router.post("/servers/:id/stop", async (req, res) => {
  try {
    await serverController.stopServer(req.user.id, req.params.id);
    res.redirect("/moderator/server-dashboard");
  } catch (e) {
    console.error(e);
    const status = e.message.startsWith("Unauthorized") ? 403 : 500;
    res.status(status).send("Error stopping server: " + e.message);
  }
});

router.post("/servers/:id/delete", async (req, res) => {
  try {
    await serverController.deleteServer(req.user.id, req.params.id);
    res.redirect("/moderator/server-dashboard");
  } catch (e) {
    console.error(e);
    const status = e.message.startsWith("Unauthorized") ? 403 : 500;
    res.status(status).send("Error deleting server: " + e.message);
  }
});

export default router;