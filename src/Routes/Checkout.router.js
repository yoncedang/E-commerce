

import express from 'express'
import { checkCount, delCheckout } from '../Controller/Checkout/Checkout.controller.js'
import { AuthVerifyUser } from '../Middleware/verifyToken.js'


const checkoutRouter = express.Router()




checkoutRouter.post("/totalprice", AuthVerifyUser, checkCount)
checkoutRouter.delete("/del-checkout", AuthVerifyUser, delCheckout)



export default checkoutRouter