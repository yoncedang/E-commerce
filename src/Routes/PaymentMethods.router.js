


import express from "express";
import { AuthVerifyAdmin } from "../Middleware/verifyToken.js";
import { add_Methods, All_Methods, edit_Methods, del_Methods } from "../Controller/PaymentMethods/PaymentMethods.controller.js";

const MethodsRouter = express.Router()


MethodsRouter.post("/add-payment-methods", AuthVerifyAdmin, add_Methods)
MethodsRouter.get("/all-payment-methods", All_Methods)
MethodsRouter.put("/edit-payment-methods", AuthVerifyAdmin, edit_Methods)
MethodsRouter.delete("/del-payment-methods", AuthVerifyAdmin, del_Methods)


export default MethodsRouter