import express from "express";
import path from "path";
import fs from "fs";
import expressLayouts from "express-ejs-layouts";
import sql from "./db/sqlManager.js";
import pagesRouter from "./routes/pages.js";


const app = express();
const PORT = 3000;

app.use(expressLayouts);

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.static(path.join(process.cwd(), "public")));

app.use("/pages", pagesRouter);
app.get("/", (req, res) => res.redirect("/pages/dashboard"));

app.listen(PORT, () => {
  console.log(`Server Started on http://localhost:${PORT}`);
});
