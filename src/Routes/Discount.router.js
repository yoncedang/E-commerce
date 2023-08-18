


import express from "express"
import { 
     add_Discount, 
     edit_Discount_byName, 
     edit_Discount_byID,
     list_Discount,
     delete_Discount,

} from "../Controller/Discount/Discount.controller.js";
import { AuthVerifyAdmin } from "../Middleware/verifyToken.js";


const discountRouter = express.Router();




discountRouter.post("/add-discount", AuthVerifyAdmin, add_Discount)
discountRouter.put("/edit-discount", AuthVerifyAdmin, edit_Discount_byName)
discountRouter.put("/edit-discountByID", AuthVerifyAdmin, edit_Discount_byID)
discountRouter.get("/list-discount", list_Discount)
discountRouter.delete("/del-discount", AuthVerifyAdmin, delete_Discount)





export default discountRouter