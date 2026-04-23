import express from "express";
import { contactController } from "../Controller/ContactController.js";
const router = express.Router();
router.post("/contact", contactController);
export default router;
