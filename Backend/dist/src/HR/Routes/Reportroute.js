// src/HR/Routes/ReportRoute.ts
import express from "express";
import isHr from "../Middleware/isHr.js";
import { getReportInterviews, getInterviewReportData, sendReportEmail } from "../Controller/Reportcontroller.js";
import { reportLimiter } from "../Middleware/RateLimit.js";
const route = express.Router();
route.get("/interviews", isHr, getReportInterviews);
route.get("/interview/:id", isHr, getInterviewReportData);
route.post("/send-email", reportLimiter, isHr, sendReportEmail);
export default route;
