import express from "express";
import path from "path";
import fs from "fs";
import expressLayouts from "express-ejs-layouts";
import db from "./db/dbManager.js";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from 'passport-local';



import pagesRouter from "./routes/PublicRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRouter from "./routes/authRoutes.js";
import serverRoutes from "./routes/serverRoutes.js";
import * as auth from './controllers/authController.js';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(expressLayouts);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.static(path.join(process.cwd(), "public")));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change-this-secret',
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(async (username, password, done) => {
  const user = await db.getUserByUsername(username);
  if (!user) return done(null, false, { message: 'Incorrect username' });
  const ok = await db.verifyPassword(user, password);
  if (!ok) return done(null, false, { message: 'Incorrect password' });
  return done(null, user);
}));

passport.serializeUser((user, done) => done(null, user._id || user.id));
passport.deserializeUser(async (id, done) => {
  const u = await db.getUserById(id);
  if (u) {
    u.id = u._id.toString();
  }
  done(null, u || false);
});

app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;

  res.locals.navLinks = {
  public: [
    { name: "Dashboard", path: "/pages/dashboard", key: "dashboard", css: "NA" }
  ],
  moderator: [
    { name: "Server Manager", path: "/servers/server-manager", key: "server-manager", css: "NA" }
  ],
  admin: [
    { name: "User Management", path: "/admin/user-management", key: "user-management", css: "NA" }
  ]
  
};

  next();
});

app.use("/pages", pagesRouter);
app.use("/auth", authRouter);
app.use("/admin", adminRoutes);
app.use('/servers', serverRoutes);
app.get("/", (req, res) => res.redirect("/pages/dashboard"));

(async () => {
  try {
    await db.init();

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
