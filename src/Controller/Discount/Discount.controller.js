




import { Server_500, NotFound_404, Unauthorized_401, Forbiden_403, OK_200, Found_422 } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";


const add_Discount = async (req, res) => {

     try {
          const { code, quantity, value, expiredAt } = req.body;
          if (!code || !quantity || !value) {
               return NotFound_404(res, "Please input information")
          }
          if (new Date(expiredAt).getTime() <= Date.now()) {
               return NotFound_404(res, "expiredAt must be in the future");
          }
          const checkCode = await query.discount.findOne({
               where: { code }
          })
          if (checkCode) {
               return Found_422(res, "Code already created")
          }
          const addDiscount = await query.discount.create({
               code,
               quantity,
               value,
               expiredAt
          })
          OK_200(res, addDiscount, "Add success Discount")

     } catch (error) {
          Server_500(res, error)
     }
}

const edit_Discount_byName = async (req, res) => {

     try {
          const { code } = req.query
          if (!code) {
               return NotFound_404(res, "Please input code")
          }
          const checkCode = await query.discount.findOne({
               where: { code }
          })

          if (!checkCode) {
               return NotFound_404(res, "Code not found in database")
          }
          const { quantity, value, expiredAt } = req.body; // Lấy các giá trị từ req.body
          if (new Date(expiredAt).getTime() <= Date.now()) {
               return NotFound_404(res, "expiredAt must be in the future");
          }
          const editCode = await checkCode.update({
               quantity,
               value,
               expiredAt
          })

          OK_200(res, editCode, "Update success promotion code")

     } catch (error) {
          Server_500(res, error)
     }
}

const edit_Discount_byID = async (req, res) => {

     try {
          const { discountID } = req.query
          if (!discountID) {
               return NotFound_404(res, "Please input code")
          }
          const checkCode = await query.discount.findByPk(discountID)

          if (!checkCode) {
               return NotFound_404(res, "Code not found in database")
          }
          const { code, quantity, value, expiredAt } = req.body; // Lấy các giá trị từ req.body
          if (new Date(expiredAt).getTime() <= Date.now()) {
               return NotFound_404(res, "expiredAt must be in the future");
          }
          const editCode = await checkCode.update({
               code,
               quantity,
               value,
               expiredAt
          })

          OK_200(res, editCode, "Update success promotion code")

     } catch (error) {
          Server_500(res, error)
     }
}

const list_Discount = async (req, res) => {

     try {
          const data = await query.discount.findAll()
          OK_200(res, data, "List Discount")
     } catch (error) {
          Server_500(res, error)
     }


}

const delete_Discount = async (req, res) => {

     try {
          const { discountID } = req.query;
          if (!discountID) {
               return NotFound_404(res, "Please input value")
          }

          const checkDiscountID = await query.discount.findByPk(discountID)
          if (!checkDiscountID) {
               return NotFound_404(res, "Discount not found")
          }

          const delDiscount = await checkDiscountID.destroy()
          OK_200(res, delDiscount, "Delete success Discount")



     } catch (error) {
          Server_500(res, error)
     }
}


export {
     add_Discount,
     edit_Discount_byName,
     edit_Discount_byID,
     list_Discount,
     delete_Discount
}