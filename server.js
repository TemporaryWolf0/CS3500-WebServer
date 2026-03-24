import express from "express";
import path from "path";
import fs from "fs";
import expressLayouts from "express-ejs-layouts";
import dotenv from "dotenv";
import db from "./db/dbManager.js";

dotenv.config();

import pagesRouter from "./routes/PublicRoutes.js";
import authRouter from "./routes/authRoutes.js";
import * as auth from './controllers/authController.js';


const app = express();
const PORT = 3000;

app.use(expressLayouts);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.static(path.join(process.cwd(), "public")));

app.use("/pages", pagesRouter);
app.use("/auth", authRouter);
app.get("/", (req, res) => res.redirect("/pages/dashboard"));

// initialize database (creates collections/indexes) and perform startup tasks
(async () => {
  try {
    await db.init();

    // If admin creds provided via env, ensure an admin user exists using auth controller
    const adminUser = process.env.ADMIN_USERNAME || process.env.ADMIN_USER;
    const adminPass = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS;
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminUser && adminPass) {
      if (typeof auth.ensureAdmin === 'function') {
        try {
          const res = await auth.ensureAdmin({ username: adminUser, password: adminPass, email: adminEmail });
          if (res && res.created) console.log('Created admin user:', res.user._id || res.user.id);
          else console.log('Admin user already exists:', res.user._id || res.user.id);
        } catch (e) {
          console.error('Error ensuring admin user exists via authController', e);
        }
      } else {
        console.warn('authController.ensureAdmin not available');
      }
    }

    app.listen(PORT, () => {
      console.log(`Server Started on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Startup error', err);
    process.exit(1);
  }
})();
