import  express, { Router } from  'express'
import { DevLoginController } from '../Controller/DevAuthController.js'

const route : Router = express.Router()


route.post('/login',DevLoginController);


export  default route