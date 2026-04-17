import { isDeveloper } from "../../Dev/MIddleware/isDeveloper.js";
import { runCode, submitCodeAnswer } from "../Controller/CodeController.js";
import express from 'express';
const route = express.Router();
route.post("/run", isDeveloper, runCode);
route.post("/submit", isDeveloper, submitCodeAnswer);
export default route;
