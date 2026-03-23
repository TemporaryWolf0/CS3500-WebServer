import express from "express";
import path from "path";
import fs from "fs";

const router = express.Router();

const navLinks = [
  { name: "Dashboard", path: "/pages/dashboard", key: "dashboard" },
  { name: "login", path: "/pages/login", key: "login" },
  { name: "register", path: "/pages/register", key: "register" }
];

router.get("/*page", (req, res) => {
  let page = req.params.page || "dashboard";

  const template = path.join(process.cwd(), "views", "pages", `${page}.ejs`);

  if (!fs.existsSync(template)) {
    return res.status(404).render("layout", {
      title: "Not Found",
      key: "NA",
      active: "none",
      content: "pages/404",
      navLinks
    });
  }

  res.render("layout", {
    title: page,
    active: page,
    content: `pages/${page}.ejs`,
    navLinks
  });
});

export default router;
