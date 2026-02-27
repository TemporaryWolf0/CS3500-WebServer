import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Later this will come from SQL
const navLinks = [
  { name: "Home", path: "/pages/home", key: "home" },
  { name: "About", path: "/pages/about", key: "about" },
  { name: "Contact", path: "/pages/contact", key: "contact" }
];

export function renderPage(req, res) {
  const page = req.params.page || "home";

  const templatePath = path.join(
    __dirname,
    "..",
    "views",
    "pages",
    `${page}.ejs`
  );

  if (!fs.existsSync(templatePath)) {
    return res.status(404).render("layout", {
      title: "Not Found",
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
}