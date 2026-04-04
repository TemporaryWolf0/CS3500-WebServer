import express from "express";
import * as authController from "../controllers/authController.js";
import db from "../db/dbManager.js";

const router = express.Router();

// Use controller handlers for routes
router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

// Logout route
router.get("/logout", authController.logout);

// Profile update (authenticated users only)
router.post('/profile-update', async (req, res) => {
	try {
		if (!req.isAuthenticated || !req.isAuthenticated()) return res.redirect('/pages/login');

		// Use original username to locate user if they changed the username in the form
		const origUsername = req.body.origUsername || (req.user && (req.user.username || req.user.name));
		const { name, username, email, phone } = req.body;
		const updateFields = {};
		if (name) updateFields.name = name;
		if (email) updateFields.email = email;
		if (phone) updateFields.phone = phone;

		// Only update username if provided and different
		if (username && username !== origUsername) updateFields.username = username;

		await db.updateUser(origUsername, updateFields);
		return res.redirect('/pages/profile');
	} catch (err) {
		console.error('Profile update error', err);
		return res.redirect('/pages/profile');
	}
});

// Profile delete (authenticated users only)
router.post('/profile-delete', async (req, res, next) => {
	try {
		if (!req.isAuthenticated || !req.isAuthenticated()) return res.redirect('/pages/login');

		const uid = (req.user && (req.user._id || req.user.id));
		if (!uid) return res.redirect('/pages/profile');

		// remove user by id
		await db.removeUser(uid.toString());

		// logout and destroy session
		req.logout(() => {
			if (req.session) req.session.destroy(() => {});
			return res.redirect('/pages/register');
		});
	} catch (err) {
		console.error('Profile delete error', err);
		return res.redirect('/pages/profile');
	}
});

export default router;
