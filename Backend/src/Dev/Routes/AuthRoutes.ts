import  express, { Router } from  'express'
import { DevLoginController, DevLogoutController, DevOtpResend, otpValidationDev } from '../Controller/DevAuthController.js'

const route : Router = express.Router()


route.post('/login',DevLoginController);
route.post('/otpValidation',otpValidationDev)
route.post('/ResendOtp', DevOtpResend)
route.post('/logout',DevLogoutController)
export  default route