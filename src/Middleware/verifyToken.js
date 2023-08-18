import { NotFound_404, Server_500, Unauthorized_401 } from "../Config/status.repsonse.js"
import CryptoJS from "crypto-js";
import { verifyAccount } from "../JWT/jwt.config.js";
import query from "../Model/Main.js";


const AuthVerifyToken = (req, res, next) => {

     try {
          const { accessToken } = req.cookies;
          if (!accessToken) {
               return NotFound_404(res, 'AccessToken not Found')
          }
          const decryptToken = CryptoJS.AES.decrypt(accessToken, process.env.CRYPTO_KEY).toString(CryptoJS.enc.Utf8);
          verifyAccount(decryptToken, (err, user) => {
               if (err) {
                    return Server_500(res, err)
               }
               req.user = user
               next()
               // console.log(user)
          })

     } catch (error) {
          Server_500(res, error)
     }
}


const AuthVerifyAdmin = (req, res, next) => {

     try {
          AuthVerifyToken(req, res, async () => {

               const { data } = req.user;
               const { email } = data;

               const checkRole = await query.USER.findOne({
                    where: { email }
               })
               if(!checkRole) {
                    return NotFound_404(res, 'User not found')
               }
               if(checkRole.role === "admin")     {
                    next()
               }
               else {
                    return Unauthorized_401(res, 'You are not allow')
               }

          })
     } catch (error) {
          Server_500(res, error)
     }
}

const AuthVerifyUser = (req, res, next) => {

     try {
          AuthVerifyToken(req, res, async () => {

               const { data } = req.user;
               const { email } = data;

               const checkRole = await query.USER.findOne({
                    where: { email }
               })
               if(!checkRole) {
                    return NotFound_404(res, 'User not found')
               }
               if(checkRole.role === "user")     {
                    next()
               }
               else {
                    return Unauthorized_401(res, 'You are not allow')
               }

          })
     } catch (error) {
          Server_500(res, error)
     }
}



export {
     AuthVerifyToken,
     AuthVerifyAdmin,
     AuthVerifyUser
}