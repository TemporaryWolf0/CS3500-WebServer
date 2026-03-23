import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Use controller handlers for routes
router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);

router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);

export default router;
