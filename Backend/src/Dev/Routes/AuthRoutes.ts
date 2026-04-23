import express, { Router } from 'express'
import { DevLoginController, DevLogoutController, DevOtpResend, getDevMeController, MaginLinkVarification, otpValidationDev } from '../Controller/DevAuthController.js'
import { isDeveloper } from '../MIddleware/isDeveloper.js'
import { authLimiter } from '../../HR/Middleware/RateLimit.js'

const route: Router = express.Router()


route.post('/login', authLimiter, DevLoginController);
route.post('/otpValidation', authLimiter, otpValidationDev)
route.post('/ResendOtp', authLimiter, DevOtpResend)
route.post('/logout', DevLogoutController)
route.post('/magicLink', authLimiter, MaginLinkVarification)
route.get('/me', isDeveloper, getDevMeController)

export default route