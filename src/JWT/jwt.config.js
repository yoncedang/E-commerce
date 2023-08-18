



import jwt from 'jsonwebtoken'




const createAccessToken = (data) => {
     return jwt.sign(
          { data },
          process.env.ACCESS_KEY,
          { expiresIn: "30s" }
     )
}
const createRefreshToken = (data) => {
     return jwt.sign(
          { data },
          process.env.ACCESS_KEY,
          { expiresIn: "31560000s" }
     )
}
const TokenVerifyEmail = (data) => {
     return jwt.sign(
          { data },
          process.env.ACCESS_KEY,
          { expiresIn: "15m" }
     )
}

const verifyAccount = (token, cb) =>    {
     return jwt.verify(
          token,
          process.env.ACCESS_KEY,
          cb
     )
}

const decodedToken = (token) => {
     return jwt.decode(token)
}

export {
     TokenVerifyEmail,
     createAccessToken,
     createRefreshToken,
     decodedToken,
     verifyAccount
}