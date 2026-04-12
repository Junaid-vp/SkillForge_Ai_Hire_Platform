
import { isDeveloper } from "../../Dev/MIddleware/isDeveloper.js"
import { runCode, submitCodeAnswer } from "../Controller/CodeController.js"
import express, { Router } from 'express'
 
const route :Router = express.Router()
 

route.post("/run", isDeveloper, runCode)
route.post("/submit",      isDeveloper, submitCodeAnswer) 
export default route
 