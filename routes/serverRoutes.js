import express from "express";
import path from "path";
import fs from "fs";
import * as serverController from "../controllers/serverController.js";

const router = express.Router();

function ensureModMin(req, res, next) {
  if (req.isAuthenticated() && (req.user.role === 'admin' || req.user.role === 'moderator')) {
    return next();
  }
  return res.redirect('/pages/dashboard');
}

router.use(ensureModMin);

router.get("/server-manager", async (req, res) => {
  try {
    const servers = await serverController.getUserServers(req.user.id);
    res.render("layout", {
      title: "Server Manager",
      active: "server-manager",
      content: "serverManagement/servers-layout.ejs",
      servers,
      currentServerId: "",
      isNew: false
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Error loading servers");
  }
});

router.get("/server-manager/new", async (req, res) => {
  try {
    const servers = await serverController.getUserServers(req.user.id);
    res.render("layout", {
      title: "Server Manager",
      active: "server-manager",
      content: "serverManagement/servers-layout.ejs",
      servers,
      currentServerId: "",
      isNew: true
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Error loading servers");
  }
});

router.get("/server-manager/:id", async (req, res) => {
  try {
    const servers = await serverController.getUserServers(req.user.id);
    res.render("layout", {
      title: "Server Manager",
      active: "server-manager",
      content: "serverManagement/servers-layout.ejs",
      servers,
      currentServerId: req.params.id,
      isNew: false
    });
  } catch (e) {
    console.error(e);
    res.status(500).send("Error loading servers");
  }
});

router.post("/create", async (req, res) => {
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
 
    res.redirect("/servers/server-manager");
  } catch (e) {
    console.error(e);
    res.status(500).send("Error creating server: " + e.message);
  }
});

router.post("/:id/start", async (req, res) => {
  try {
    await serverController.startServer(req.user.id, req.params.id);
    res.redirect("/servers/server-manager");
  } catch (e) {
    console.error(e);
    const status = e.message.startsWith("Unauthorized") ? 403 : 500;
    res.status(status).send("Error starting server: " + e.message);
  }
});
//
router.post("/:id/stop", async (req, res) => {
  try {
    await serverController.stopServer(req.user.id, req.params.id);
    res.redirect("/servers/server-manager");
  } catch (e) {
    console.error(e);
    const status = e.message.startsWith("Unauthorized") ? 403 : 500;
    res.status(status).send("Error stopping server: " + e.message);
  }
});

router.post("/:id/delete", async (req, res) => {
  try {
    await serverController.deleteServer(req.user.id, req.params.id);
    res.redirect("/servers/server-manager");
  } catch (e) {
    console.error(e);
    const status = e.message.startsWith("Unauthorized") ? 403 : 500;
    res.status(status).send("Error deleting server: " + e.message);
  }
});

export default router;