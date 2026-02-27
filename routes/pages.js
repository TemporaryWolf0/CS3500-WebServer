import express from "express";
import { renderPage } from "../controllers/pagesController.js";

const router = express.Router();

router.get("/", renderPage);
router.get("/pages/:page", renderPage);

export default router;