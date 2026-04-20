import express from "express";
import path from "path";
import fs from "fs";
import * as serverController from "../controllers/serverController.js";
import * as systemController from "../controllers/systemController.js";

const router = express.Router();

router.get("/dashboard", async (req, res) => {

  let serversStats = await serverController.getAllStatistics();
  let hostStats = await systemController.getHostStats();

  res.render("layout", {
    title: "Dashboard",
    active: "dashboard",
    content: `pages/dashboard.ejs`,
    serversStats,
    hostStats,
    
  });
  console.log("Host stats:", hostStats);
});

router.get("/*page", async (req, res) => {
  let page = req.params.page;
  if (!page) {
    return res.redirect("/dashboard");
  }
  const template = path.join(process.cwd(), "views", "pages", `${page}.ejs`);

  if (!fs.existsSync(template)) {
    return res.status(404).render("layout", {
      title: "404",
      active: "none",
      content: "pages/404.ejs",
    });
  }

  res.render("layout", {
    title: page,
    active: page,
    content: `pages/${page}.ejs`,
  });
});

export default router;
