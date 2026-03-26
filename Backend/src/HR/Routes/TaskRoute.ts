import express, { Router } from 'express'
import isHr from '../Middleware/isHr.js'
import { assignTask } from '../Controller/TaskController.js'

const route : Router = express.Router()


route.post('/taskassgin',isHr,assignTask)



export default route