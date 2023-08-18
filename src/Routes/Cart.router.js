



import express from 'express'
import { AuthVerifyUser } from '../Middleware/verifyToken.js';
import { addProductCart, GETaddProductCart, delProductFromCart } from '../Controller/Cart/Cart.controller.js';


const cartRouter = express.Router();


cartRouter.post("/addCart", AuthVerifyUser, addProductCart )
cartRouter.get("/listCart", AuthVerifyUser, GETaddProductCart )
cartRouter.delete("/delete-product", AuthVerifyUser, delProductFromCart )







export default cartRouter