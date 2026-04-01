import express, { Router } from 'express'
import isHr from '../Middleware/isHr.js'
import { upload } from '../Middleware/multer.js'
import { parseResumeController, specificDevTotalDetails } from '../Controller/ResumeController.js'

const route = express.Router()

route.post('/upload',isHr,upload.single("resume"),parseResumeController)
route.get('/totalDetails/:id',isHr,specificDevTotalDetails)

export default route