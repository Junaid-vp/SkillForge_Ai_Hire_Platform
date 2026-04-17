import express, { Router } from 'express'
import { DevLoginController, DevLogoutController, DevOtpResend, getDevMeController, MaginLinkVarification, otpValidationDev } from '../Controller/DevAuthController.js'
import { isDeveloper } from '../MIddleware/isDeveloper.js'

const route: Router = express.Router()


route.post('/login', DevLoginController);
route.post('/otpValidation', otpValidationDev)
route.post('/ResendOtp', DevOtpResend)
route.post('/logout', DevLogoutController)
route.post('/magicLink', MaginLinkVarification)
route.get('/me', isDeveloper, getDevMeController)

export default route