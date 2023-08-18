


import { OK_200, NotFound_404, Found_422, Server_500, Unauthorized_401, Forbiden_403 } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";
import bcrypt from 'bcrypt'
import { SendLinkVerification, generateRandomCode, SendLinkRetsetPassword, Notifications } from "../../Middleware/nodeMailer.js";
import { TokenVerifyEmail, createAccessToken, decodedToken } from "../../JWT/jwt.config.js";
import crypto from "crypto-js";
import { AuthVerifyToken } from "../../Middleware/verifyToken.js";



const signup = async (req, res) => {
     try {
          const { email, password } = req.body;
          const checkEmail = await query.USER.findOne({
               where: { email }
          })
          if (checkEmail) {
               Found_422(res, 'Email already exists !!!')
          }
          else {
               const code = generateRandomCode()
               const data = await query.USER.create({
                    email,
                    password: bcrypt.hashSync(password, 10),
               })

               await query.verify.create({
                    OTP: code,
                    user_id: data.user_id,
                    expiredAt: new Date().getTime() + 25200000
               })

               const token = TokenVerifyEmail({ email, code })
               OK_200(res, data, 'Please check Email verify')

               await SendLinkVerification(email, token, code)
          }
     } catch (error) {
          Server_500(res, error)
     }
}

const verify_Email = async (req, res) => {
     try {
          const { token } = req.query;
          if (!token) {
               return NotFound_404(res, 'Token verify not found')
          }
          else {
               const information = decodedToken(token)
               const { email } = information.data
               const currentUSER = await query.USER.findOne({
                    where: { email }
               })
               if (currentUSER.activity === "online") {
                    return OK_200(res, 'Account already activated')
               }
               else {
                    if (new Date().getTime() >= information.exp * 1000) {
                         await query.verify.destroy({
                              where: { user_id: currentUSER.user_id }
                         })

                         await query.USER.destroy({
                              where: { user_id: currentUSER.user_id }
                         })
                         return Unauthorized_401(res, 'Token EXPIRED')
                    }
                    else {
                         await currentUSER.update({
                              activity: "online",
                              isUpdated: true,
                         })
                         await query.verify.destroy({
                              where: { user_id: currentUSER.user_id }
                         })
                         await Notifications(email)
                         OK_200(res, 'Success: account is active')
                    }
               }
          }
     } catch (error) {
          Server_500(res, error)
     }
}

const verify_OTP = async (req, res) => {

     try {
          const { OTP } = req.body;
          if (!OTP) {
               return NotFound_404(res, 'Please input OTP')
          }
          const checkOTP = await query.verify.findOne({
               where: { OTP }
          })
          if (!checkOTP) {
               return NotFound_404(res, 'OTP not found')
          }

          else {
               if (checkOTP.expiredAt < new Date().getTime()) {
                    await query.verify.destroy({
                         where: { OTP: checkOTP.OTP }
                    })
                    return Unauthorized_401(res, 'OTP code is Expired')
               }
               else {
                    await query.USER.update({
                         activity: "online",
                         isUpdated: true,
                    }, { where: { user_id: checkOTP.user_id } })

                    await checkOTP.destroy({
                         where: { user_id: checkOTP.user_id }
                    })
                    return OK_200(res, 'Account xac thuc thanh cong')
               }
          }
     } catch (error) {
          Server_500(res, error)
     }


}

const login = async (req, res) => {
     try {
          const { email, password } = req.body;
          const currentUser = await query.USER.findOne({
               where: { email }
          })

          if (!currentUser) {
               return NotFound_404(res, 'Email not found')
          }
          else {
               const comparePassword = bcrypt.compareSync(password, currentUser.password);
               if (!comparePassword) {
                    return NotFound_404(res, 'Password not match')
               }
               else {
                    const accessToken = createAccessToken({ email })
                    const refreshToken = createAccessToken({ email })

                    const hashToken = crypto.AES.encrypt(accessToken, process.env.CRYPTO_KEY).toString();


                    const checkToken = await query.token.findOne({
                         where: { user_id: currentUser.user_id }
                    })

                    if (!checkToken) {
                         await query.token.create({
                              refreshToken: refreshToken,
                              expiredAt: new Date().getTime() + (31560000000),
                              user_id: currentUser.user_id
                         })
                    }
                    else {
                         return Found_422(res, 'RefreshToken is alive')
                    }
                    res.cookie("accessToken", hashToken)
                    OK_200(res, accessToken, 'Login success')
               }
          }
     } catch (error) {
          Server_500(res, error)
     }

}

const forgotPassword = async (req, res) => {

     try {
          const { email } = req.body;
          if (!email) {
               return Unauthorized_401(res, "Please input email")
          }

          const checkEmail = await query.USER.findOne({
               where: { email }
          })

          if (!checkEmail) {
               return NotFound_404(res, 'Email not found')
          }
          else {
               const code = generateRandomCode()

               const verification = TokenVerifyEmail({ email });

               const checkOTP = await query.verify.findOne({
                    where: { user_id: checkEmail.user_id }
               })

               if (!checkOTP) {
                    await query.verify.create({
                         OTP: code,
                         user_id: checkEmail.user_id,
                         expiredAt: new Date().getTime() + 900000,
                         timeReq: new Date().getTime() + 30000,
                    })
                    OK_200(res, 'A verification link sent to your email')
               }
               else {
                    if (checkOTP.timeReq.getTime() < new Date().getTime()) {
                         await checkOTP.update({
                              OTP: code,
                              expiredAt: new Date().getTime() + 900000,
                              timeReq: new Date().getTime() + 30000,
                         })
                         OK_200(res, 'Resend success')
                    }
                    else {
                         console.log(checkOTP.timeReq.getTime())
                         console.log(new Date().getTime())

                         return Unauthorized_401(res, 'Request after: ' + (new Date().getSeconds()))
                    }
               }
               await SendLinkRetsetPassword(email, verification, code)

          }
     } catch (error) {
          Server_500(res, error)
     }
}

const passRetset_Verify = async (req, res) => {

     try {
          const { token } = req.query;
          const { password } = req.body
          if (!token) {
               return NotFound_404(res, "Token verification not found")
          }
          const tokenDecoded = decodedToken(token)
          const { data } = tokenDecoded
          const { email } = data

          const currentUser = await query.USER.findOne({
               where: { email }
          })

          if (tokenDecoded.exp * 1000 < new Date().getTime()) {
               return Unauthorized_401(res, 'Token Expired, Please resend !!!')
          }

          if (currentUser.isUpdated === true) {
               return OK_200(res, 'Password already updated')
          }

          await currentUser.update({
               password: bcrypt.hashSync(password, 10),
               isUpdated: true
          })
          await query.verify.destroy({
               where: { user_id: currentUser.user_id }
          })


          OK_200(res, 'Update Password Success')


     } catch (error) {
          Server_500(res, error)
     }
}

const passRetset_OTP = async (req, res) => {


     try {
          const { OTP, password } = req.body;
          if (!OTP) {
               return NotFound_404(res, 'Please input OTP')
          }
          const checkOTP = await query.verify.findOne({
               where: { OTP }
          })

          if (!checkOTP) {
               return NotFound_404(res, 'OTP is wrong')
          }
          else {
               if (checkOTP.expiredAt.getTime() > new Date().getTime()) {
                    const checkUser = await query.USER.findOne({
                         where: { user_id: checkOTP.user_id }
                    });
                    if (!checkUser) {
                         return NotFound_404(res, 'User not FOUND')
                    }
                    await checkUser.update({
                         password: bcrypt.hashSync(password, 10),
                         isUpdated: true
                    })

                    await query.verify.destroy({
                         where: { user_id: checkUser.user_id }
                    })

                    OK_200(res, 'Password updated')
               }
               else {
                    return Unauthorized_401(res, 'OTP is missing, Please resend !!!')
               }
          }

     } catch (error) {
          Server_500(res, error)
     }
}

const reqToken = async (req, res) => {


     try {
          console.log(new Date().getTime())
          const { refreshToken } = req.body;
          if (!refreshToken) {
               return NotFound_404(res, "Please input Refreshtoken")
          }

          const currentUSER = await query.token.findOne({
               where: { refreshToken }
          })
          if (!currentUSER) {
               return NotFound_404(res, 'RefreshToken not FOUND! Please try again')
          }
          const tokenDecoded = decodedToken(refreshToken)
          const { email } = tokenDecoded.data

          const currentAccount = await query.USER.findOne({
               where: { email }
          })
          if (!currentAccount) {
               return NotFound_404(res, 'Account not found')
          }
          else {
               const accessToken = createAccessToken({ email })
               const hashToken = crypto.AES.encrypt(accessToken, process.env.CRYPTO_KEY).toString();

               res.cookie("accessToken", hashToken)

               OK_200(res, accessToken, 'Request Success')
          }
     } catch (error) {
          Server_500(res, error)
     }
}

const logout = async (req, res) => {

     try {
          AuthVerifyToken(req, res, async () => {
               const { data } = req.user;
               const { email } = data;

               const checkUser = await query.USER.findOne({
                    where: { email }
               })
               if (!checkUser) {
                    return NotFound_404(res, 'User not found')
               }
               await query.token.destroy({
                    where: { user_id: checkUser.user_id }
               })
               res.clearCookie("accessToken")
               OK_200(res, "Logout success")

          })
     } catch (error) {
          Server_500(res, error)
     }


}




export {
     signup,
     verify_Email,
     verify_OTP,
     login,
     forgotPassword,
     passRetset_Verify,
     passRetset_OTP,
     reqToken,
     logout,

}



// https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Version=2.0.1&vnp_Command=pay&vnp_TmnCode=VV6SHL4S&vnp_Locale=vn&vnp_CurrCode=VND&vnp_TxnRef=191&vnp_OrderInfo=Payment:#191&vnp_Amount=102000000&vnp_ReturnUrl=http://localhost:8080/payment/callback&vnp_OrderType=other&vnp_IpAddr=127.0.0.1&vnp_CreateDate=20230818090813&vnp_SecureHash=e743188cdf5d66009f16e7277ef15a53468ee6a8038d5f2c85696222e0d10e85b21e5ac0cb0dfe0a947a2367ec9eebe80cfb49e6e8bf88d16bf841c6e3125433



// https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=1806000&vnp_Command=pay&vnp_CreateDate=20210801153333&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+don+hang+%3A5&vnp_OrderType=other&vnp_ReturnUrl=https%3A%2F%2Fdomainmerchant.vn%2FReturnUrl&vnp_TmnCode=DEMOV210&vnp_TxnRef=5&vnp_Version=2.1.0&vnp_SecureHash=3e0d61a0c0534b2e36680b3f7277743e8784cc4e1d68fa7d276e79c23be7d6318d338b477910a27992f5057bb1582bd44bd82ae8009ffaf6d141219218625c42