



import { Server_500, NotFound_404, Unauthorized_401, Forbiden_403, OK_200, Found_422 } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";
import { AuthVerifyUser } from "../../Middleware/verifyToken.js";




const checkCount = async (req, res) => {

     try {
          AuthVerifyUser(req, res, async () => {
               const { data } = req.user;
               const { email } = data
               const checkEmail = await query.USER.findOne({ where: { email } })

               if (!checkEmail) {
                    return NotFound_404(res, "User not found")
               }

               const total = await query.cart.sum("totalPrice", {
                    where: { user_id: checkEmail.user_id }
               })

               let discountTotalPrice = total
               let discountByID = null

               const { code } = req.body;
               if (code) {
                    const checkQuantity = await query.cart.findAll({
                         where: { user_id: checkEmail.user_id }
                    })
                    const countQuantity = checkQuantity.reduce((total, cartProduct) => total + cartProduct.quantity, 0);
  
                    if (checkQuantity.length < 2 && countQuantity < 2) {
                         return OK_200(res, "Promotion Code is only applicable for 2 products or more ")
                    }
                    const checkCode = await query.discount.findOne({
                         where: { code }
                    })
                    if (checkCode) {
                         discountByID = checkCode.discount_id
                         discountTotalPrice -= checkCode.value < 100
                              ? (total * checkCode.value) / 100
                              : checkCode.value
                    }
               }

               const checkUpdateDiscount = await query.checkout.findOne({
                    where: { user_id: checkEmail.user_id }
               })
               const dataCheckout = {
                    user_id: checkEmail.user_id,
                    totalPrice: discountTotalPrice,
                    discount_id: discountByID
               }
               
               if (!checkUpdateDiscount) {
                    const checkOut = await query.checkout.create(
                         dataCheckout
                    )
                    return OK_200(res, checkOut, `User code: ${code}`)
               }
               const checkOut = await checkUpdateDiscount.update(
                    dataCheckout
               )
               OK_200(res, checkOut, `Update code: ${code}`)


               // const [checkOut, created] = await query.checkout.findOrCreate({
               //      where: { user_id: checkEmail.user_id },
               //      defaults: {
               //           totalPrice: discountTotalPrice,
               //           discount_id: discountByID
               //      }
               // });

               // if (created) {
               //      OK_200(res, checkOut, "Check out");
               // } else {
               //      const checkOutUpdate = {
               //           totalPrice: discountTotalPrice,
               //           discount_id: discountByID
               //      };
               //      const updatedCheckOut = await checkOut.update(checkOutUpdate);
               //      OK_200(res, updatedCheckOut, "Check out update");
               // }

          })
     } catch (error) {
          Server_500(res, error)
     }

};


const delCheckout = async (req, res) => {

     try {
          AuthVerifyUser(req, res, async () => {
               const { data } = req.user;
               const { email } = data;
               const checkEmail = await query.USER.findOne({ where: { email } })

               if (!checkEmail) {
                    return NotFound_404(res, "User not found")
               }

               const checkDataCheckout = await query.checkout.findOne({
                    where: { user_id: checkEmail.user_id }
               })
               if (!checkDataCheckout) {
                    return NotFound_404(res, "Checkout is empty !!!")
               }
               await checkDataCheckout.destroy()
               OK_200(res, "Del success")
          })
     } catch (error) {
          Server_500(res, error)
     }
}


export {
     checkCount,
     delCheckout
}