import express, { Router } from "express";
import isHr from "../Middleware/isHr.js";
import {
  generateUniqueCode,
  getDevelopers,
  rescheduleInterview,
  sheduleInterview,
  sheduledInterviewDetails,
} from "../Controller/InterViewController.js";

const route: Router = express.Router();

route.post("/generate-code", isHr, generateUniqueCode);
route.post("/schedule", isHr, sheduleInterview);
route.get("/interviews", isHr, sheduledInterviewDetails);
route.get("/developers", isHr, getDevelopers);
route.put("/reschedule", isHr, rescheduleInterview);
export default route;
