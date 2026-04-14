import express, { Router } from 'express'
import isHr from '../Middleware/isHr.js'
import { assignTask, submitTask } from '../Controller/TaskController.js'
import { isDeveloper } from '../../Dev/MIddleware/isDeveloper.js'
import { uploadZipFile } from '../Middleware/multer.js'

const route : Router = express.Router()


route.post('/taskassgin',isHr,assignTask)
route.post("/submit", isDeveloper, uploadZipFile.single("file"), submitTask)


export default route