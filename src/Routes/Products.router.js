

import express from 'express';
import { All_Products, Navigation_Products, search_Products, edit_Products, del_Products, add_Products } from '../Controller/Products/Products.controller.js';
import { AuthVerifyAdmin } from '../Middleware/verifyToken.js';
import multer from 'multer'

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


const productsRouter = express.Router();


productsRouter.get("/get-products", All_Products)
productsRouter.get("/pagination", Navigation_Products)
productsRouter.get("", search_Products)
productsRouter.put("/edit", AuthVerifyAdmin, upload.single("file"), edit_Products)
productsRouter.delete("/delete", AuthVerifyAdmin, del_Products)
productsRouter.post("/add-product", AuthVerifyAdmin, upload.single("file"), add_Products)



export default productsRouter