import { Router } from "express";
import { getHrMeController, HrloginController, HrLogoutController, HRregisterController, otpResend, otpValidation } from "../Controller/AuthController.js";
import isHr from "../Middleware/isHr.js";

import Validate from "../Middleware/Validate.js";
import { registerValidate } from "../Validator/Register.js";
import { LoginValidate } from "../Validator/Login.js";
import { TokenRegenrator } from "../services/tokenRegenerator.js";

const router: Router = Router()

router.post('/hr/register', Validate(registerValidate), HRregisterController)
router.post('/hr/login', Validate(LoginValidate), HrloginController)
router.post('/hr/verify-otp', otpValidation)
router.post('/hr/resent-otp', otpResend)
router.post('/refresh', TokenRegenrator)
router.post('/hr/logout', HrLogoutController)
router.get('/hr/me', isHr, getHrMeController)


export default router