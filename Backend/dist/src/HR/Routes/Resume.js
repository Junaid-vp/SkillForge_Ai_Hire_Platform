import express from 'express';
import isHr from '../Middleware/isHr.js';
import { upload } from '../Middleware/multer.js';
import { parseResumeController } from '../Controller/ResumeController.js';
const route = express.Router();
route.post('/upload', isHr, upload.single("resume"), parseResumeController);
export default route;
