import express from "express";
import path from "path";
import fs from "fs";
import dbManager from "../db/dbManager.js";

const router = express.Router();

// Middleware to ensure user is admin
function ensureAdmin(req, res, next) {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next();
  }
  return res.redirect('/pages/dashboard'); // or some error page
}

router.use(ensureAdmin);

router.get("/user-management", async (req, res) => {

  let page = "user-management";

  let users = [];
  try {
    users = await dbManager.getUserList();
  } catch (e) {
    console.error("Failed to fetch users for admin panel", e);
  }

  res.render("layout", {
    title: page,
    active: page,
    content: `admin/${page}.ejs`,
    users: users
  });

});

router.post("/user-management/new-user", async (req, res) => {
   try {
      const { name, username, email, phone = "", password, role } = req.body;
      // Make sure user doesn’t already exist
      let user = await dbManager.getUserByEmail(email);
      if (user) {
        console.log('error', 'User already exists');
        return res.redirect("/admin/user-management");
      }
  
      // Create new user (hashing handled by dbManager)
      await dbManager.createUser({ name, username, email, phone, password, role });
      console.log(`Admin ${req.user.username} created new user ${name} with role ${role}`);
      return res.redirect("/admin/user-management");
    } catch (error) {
      console.error(error);
      res.redirect('/pages/dashboard');
    }
  });

  router.post("/user-management/remove-user", async (req, res) => {
   try {
      const { userId, username } = req.body;

      // dbManager.removeUser expects the user id string as the first arg
      await dbManager.removeUser(userId);
      console.log(`Admin ${req.user.username} removed user ${username}`);
      return res.redirect("/admin/user-management");
    } catch (error) {
      console.error(error);
      res.redirect('/pages/dashboard');
    }
  });

  router.post("/user-management/update-user", async (req, res) => {
   try {
      const { name, username, email, phone = "", role } = req.body;

    // Build an update object only with fields provided
    const updateFields = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone) updateFields.phone = phone;
    if (role) updateFields.role = role;

    // Update the user by username (hidden input in the form)
    await dbManager.updateUser(username, updateFields);
    console.log(`Admin ${req.user.username} updated user ${username}`);
    return res.redirect("/admin/user-management");
    } catch (error) {
      console.error(error);
      res.redirect('/pages/dashboard');
    }
  });


export default router;