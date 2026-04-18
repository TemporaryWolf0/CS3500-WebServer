import express from "express";
import path from "path";
import fs from "fs";

const router = express.Router();



router.get("/*page", (req, res) => {
  let page = req.params.page || "dashboard";

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
