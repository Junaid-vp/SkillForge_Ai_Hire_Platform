import express, { Router } from 'express'
import isHr from '../Middleware/isHr.js'
import { uploadPdf } from '../Middleware/multer.js'
import { parseResumeController, specificDevTotalDetails } from '../Controller/ResumeController.js'

const route = express.Router()

route.post('/upload',isHr,uploadPdf.single("resume"),parseResumeController)
route.get('/totalDetails/:id',isHr,specificDevTotalDetails)

export default route