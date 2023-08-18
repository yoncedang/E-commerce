


import express from 'express'
import { orderItems } from '../Controller/Order/Order.controller.js';

const OrderRouter = express.Router();



OrderRouter.post("/order-product", orderItems)



export default OrderRouter