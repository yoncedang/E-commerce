



import { Server_500, NotFound_404, Unauthorized_401, Forbiden_403, OK_200, Found_422 } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";



const create_categories = async (req, res) => {

     try {
          const { category_name } = req.body;
          if (!category_name) {
               return NotFound_404(res, 'Please input a category product')
          }
          const checkCategories = await query.Categories.findOne({
               where: { category_name }
          })
          if (checkCategories) {
               return Found_422(res, 'Category already exists !!!')
          }
          const create = await query.Categories.create({
               category_name,
          })
          OK_200(res, create, 'Create success')
     } catch (error) {
          Server_500(res, error)
     }
}

const get_categoriesID = async (req, res) => {

     try {
          const { categories } = req.query;
          if (!categories) {
               return NotFound_404(res, "Categories must include")
          }
          const checkCategoires = await query.Categories.findOne({
               where: { category_id: categories },
               include: [
                    {
                         model: query.Products,
                         as: "Products"
                    }
               ]
          })
          if (!checkCategoires) {
               return NotFound_404(res, "Categories not found")
          }
          OK_200(res, checkCategoires, `Category: ${checkCategoires.category_name}`)

     } catch (error) {
          Server_500(res, error)
     }

}


const edit_Categories = async (req, res) => {

     try {
          const { category_id } = req.params;
          const { category_name } = req.body;
          if (!category_id) {
               return NotFound_404(res, 'ID not found')
          }
          const checkCate = await query.Categories.findOne({
               where: { category_id }
          })
          if (!checkCate) {
               return NotFound_404(res, 'Category not found')
          }
          await checkCate.update({
               category_name,
          })
          OK_200(res, "Update success")

     } catch (error) {
          Server_500(res, error)
     }
}


const All_categories = async (req, res) => {

     try {
          const All_categories = await query.Categories.findAll({
               include: [
                    {
                         model: query.Products,
                         as: "Products"
                    }
               ]
          })
          OK_200(res, All_categories, 'Categories List')
     } catch (error) {
          Server_500(res, error)
     }

}


const Del_categories = async (req, res) => {

     try {
          const { category_id } = req.params;
          if (!category_id) {
               return NotFound_404(res, 'ID not found')
          }
          const checkCate = await query.Categories.findOne({
               where: { category_id }
          })
          if (!checkCate) {
               return NotFound_404(res, 'Category not found')
          }
          await checkCate.destroy()
          OK_200(res, "Delete success")

     } catch (error) {
          Server_500(res, error)
     }

}


export {
     create_categories,
     edit_Categories,
     All_categories,
     Del_categories,
     get_categoriesID
}