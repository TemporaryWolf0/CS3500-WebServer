import express from "express";
import * as authController from "../controllers/authController.js";
import db from "../db/dbManager.js";

const router = express.Router();
router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

router.get("/logout", authController.logout);

router.post('/profile-update', async (req, res) => {
	try {
		if (!req.isAuthenticated || !req.isAuthenticated()) return res.redirect('/pages/login');

		const origUsername = req.body.origUsername || (req.user && (req.user.username || req.user.name));
		const { name, username, email, phone } = req.body;
		const updateFields = {};
		if (name) updateFields.name = name;
		if (email) updateFields.email = email;
		if (phone) updateFields.phone = phone;

		if (username && username !== origUsername) updateFields.username = username;

		await db.updateUser(origUsername, updateFields);
		return res.redirect('/pages/profile');
	} catch (err) {
		console.error('Profile update error', err);
		return res.redirect('/pages/profile');
	}
});

router.post('/profile-delete', async (req, res, next) => {
	try {
		if (!req.isAuthenticated || !req.isAuthenticated()) return res.redirect('/pages/login');

		const uid = (req.user && (req.user._id || req.user.id));
		if (!uid) return res.redirect('/pages/profile');

		await db.removeUser(uid.toString());

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
