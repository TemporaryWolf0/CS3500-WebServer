import express from "express";
import path from "path";
import fs from "fs";
import * as serverController from "../controllers/serverController.js";
import * as systemController from "../controllers/systemController.js";

const router = express.Router();

router.get("/dashboard", async (req, res) => {

  let serversStats = await serverController.getAllStatistics();
  let hostStats = await systemController.getHostStats();


  const hostRings = [
    { label: 'CPU',    pct: parseFloat(hostStats.cpu.percent),    color: ringColor(parseFloat(hostStats.cpu.percent)) },
    { label: 'Memory', pct: parseFloat(hostStats.memory.percent), color: ringColor(parseFloat(hostStats.memory.percent)) },
  ];

    const hostMeta = [
    { label: 'Memory used',  value: `${fmtBytes(hostStats.memory.used)} / ${fmtBytes(hostStats.memory.total)}` },
    { label: 'Network in',   value: hostStats.network[0]?.rxSec  ? `${fmtBytes(hostStats.network[0].rxSec)}/s`  : '—' },
    { label: 'Network out',  value: hostStats.network[0]?.txSec  ? `${fmtBytes(hostStats.network[0].txSec)}/s`  : '—' },
    { label: 'Disk read',    value: hostStats.disk?.readBytes     ? `${fmtBytes(hostStats.disk.readBytes)}/s`    : '—' },
    { label: 'Disk write',   value: hostStats.disk?.writeBytes    ? `${fmtBytes(hostStats.disk.writeBytes)}/s`   : '—' },
    { label: 'Processes',    value: `${hostStats.processes.running} running` },
  ];

  const serverRing = {
  pct: Math.round((serversStats.runningCount / serversStats.totalCount) * 100),
  color: ringColor(Math.round((serversStats.runningCount / serversStats.totalCount) * 100)),
  running: serversStats.runningCount,
  total: serversStats.totalCount,
};

  res.render("layout", {
    title: "Dashboard",
    active: "dashboard",
    content: `pages/dashboard.ejs`,
    serversStats,
    hostMeta,
    serverRing,
    hostRings
  });

    function ringColor(pct) {
    if (pct >= 85) return '#D85A30';
    if (pct >= 60) return '#EF9F27';
    return '#1D9E75';
  }

  function fmtBytes(bytes) {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes >= 1073741824) return (bytes / 1073741824).toFixed(1) + ' GB';
  if (bytes >= 1048576)    return (bytes / 1048576).toFixed(1) + ' MB';
  return (bytes / 1024).toFixed(1) + ' KB';
}

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
