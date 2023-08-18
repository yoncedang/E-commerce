



import express from 'express'
import { create_categories, edit_Categories, All_categories, Del_categories, get_categoriesID } from '../Controller/Categories/Categories.controller.js';
import { AuthVerifyAdmin } from '../Middleware/verifyToken.js';

const CategoriesRouter = express.Router();



CategoriesRouter.post("/create-categories", AuthVerifyAdmin, create_categories)
CategoriesRouter.put("/edit-category/:category_id", AuthVerifyAdmin, edit_Categories)
CategoriesRouter.get("/all-categories", All_categories)
CategoriesRouter.get("/get-categories", get_categoriesID)
CategoriesRouter.delete("/del-category/:category_id", AuthVerifyAdmin, Del_categories)





export {CategoriesRouter}
