


import express from 'express'
import cors from 'cors'
import { AuthRouter } from './src/Routes/Auth.router.js'
import { CategoriesRouter } from './src/Routes/Categories.router.js'

import MethodsRouter from './src/Routes/PaymentMethods.router.js'
import OrderRouter from './src/Routes/Order.router.js'
import ShippingRouter from './src/Routes/Shipping.router.js'
import checkoutRouter from './src/Routes/Checkout.router.js'
import discountRouter from './src/Routes/Discount.router.js'
import cartRouter from './src/Routes/Cart.router.js'
import productsRouter from './src/Routes/Products.router.js'
import cookieParser from 'cookie-parser'



const app = express()

app.use(express.static("."))
app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.use("/api/auth", AuthRouter)
app.use("/api/categories", CategoriesRouter)
app.use("/api/products", productsRouter)
app.use("/api/cart", cartRouter)
app.use("/api/discount", discountRouter)
app.use("/api/checkout", checkoutRouter)
app.use("/api/shipping", ShippingRouter)
app.use("/api/order", OrderRouter)
app.use("/api/payment", MethodsRouter)



app.listen(8080, () => {
     console.log("Connecting port 8080")
})