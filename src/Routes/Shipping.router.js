


import express from "express"
import { new_ShippingAddress, edit_ShippingAddress, del_ShippingAddress, all_ShippingAddress } from "../Controller/Shipping/Shipping.Controller.js";

const ShippingRouter = express.Router();



ShippingRouter.post("/add-new-address", new_ShippingAddress)
ShippingRouter.put("/edit-address", edit_ShippingAddress)
ShippingRouter.delete("/delete-address", del_ShippingAddress)
ShippingRouter.get("/all-address", all_ShippingAddress)



export default ShippingRouter