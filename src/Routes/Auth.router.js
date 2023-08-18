


import express from 'express'
import { signup, verify_Email, verify_OTP, login, forgotPassword, passRetset_Verify, passRetset_OTP, reqToken, logout } from '../Controller/Auth/Auth.controller.js';
import { AuthVerifyToken } from '../Middleware/verifyToken.js';
const AuthRouter = express.Router();



AuthRouter.post("/signup", signup)
AuthRouter.get("/verify-email", verify_Email)
AuthRouter.post("/verify-otp", verify_OTP)
AuthRouter.post("/login", login)
AuthRouter.post("/forgot", forgotPassword)
AuthRouter.post("/reset-password", passRetset_Verify)
AuthRouter.post("/reset-password-otp", passRetset_OTP)
AuthRouter.post("/request-token", reqToken)

AuthRouter.post("/logout", AuthVerifyToken, logout)









export {
     AuthRouter
}