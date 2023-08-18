


import { Server_500, NotFound_404, Unauthorized_401, Forbiden_403, OK_200, Found_422 } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";
import { AuthVerifyUser } from "../../Middleware/verifyToken.js";

const addProductCart = async (req, res) => {

     try {
          AuthVerifyUser(req, res, async () => {
               const { data } = req.user;
               const { email } = data;
               const { product } = req.query;
               const { quantity } = req.body

               if (isNaN(product)) {
                    return NotFound_404(res, "Must be a Number")
               }

               const currentUser = await query.USER.findOne({
                    where: { email }
               })
               if (!currentUser) {
                    return NotFound_404(res, "User not found")
               }

               const checkProducts = await query.Products.findOne({
                    where: { product_id: product }
               })
               if (!checkProducts) {
                    return NotFound_404(res, "Products not found")
               }

               if (checkProducts.quantity_stock <= 0) {
                    return NotFound_404(res, "SOLD OUT !!!")
               }
               else {
                    const checkCart = await query.cart.findOne({
                         where: { product_id: product }
                    })

                    if (quantity > checkProducts.quantity_stock) {
                         return NotFound_404(res, `Not enough quantity --- MAX: ${checkProducts.quantity_stock} products`);
                    }

                    if (!checkCart) {
                         const checkInputQuantity = quantity ? quantity : 1
                         const addProduct = await query.cart.create({
                              user_id: currentUser.user_id,
                              product_id: checkProducts.product_id,
                              quantity: checkInputQuantity,
                              price: checkProducts.price,
                              totalprice: checkInputQuantity * checkProducts.price
                         })
                         OK_200(res, addProduct, `Add success Product`)
                    }

                    else {
                         if (quantity == null) {
                              return NotFound_404(res, "Quantity is required to update")
                         }
                         if (quantity < 1) {
                              const delProductCart = checkCart.destroy();
                              return OK_200(res, delProductCart, "Del success product from cart")
                         }
                         const updateProductCart = checkCart.update({
                              quantity,
                              totalprice: quantity * checkProducts.price
                         })
                         return OK_200(res, updateProductCart, "Update success")
                    }
               }
          })
     } catch (error) {
          Server_500(res, error)
     }
}

const GETaddProductCart = async (req, res) => {

     try {
          AuthVerifyUser(req, res, async () => {
               const { data } = req.user;
               const { email } = data;

               const checkUser = await query.USER.findOne({
                    where: { email }
               })
               if (checkUser) {

                    const data = await query.cart.findAll({
                         include: [
                              "product",
                         ],
                         where: { user_id: checkUser.user_id },
                    });

                    OK_200(res, data, 'List product Cart')
               }
          })
     } catch (error) {
          Server_500(res, error)
     }

}

const delProductFromCart = async (req, res) => {

     try {
          AuthVerifyUser(req, res, async () => {
               const { product } = req.query
               const { data } = req.user;
               const { email } = data;

               const checkUser = await query.USER.findOne({
                    where: { email }
               })

               if (!checkUser) {
                    return NotFound_404(res, "User not found")
               }

               const productCart = await query.cart.findOne({
                    where: { user_id: checkUser.user_id }
               })
               if (!productCart) {
                    return NotFound_404(res, 'Product is empty !!!')
               }

               const checkCartProduct = await query.cart.findOne({
                    where: { product_id: product }
               })

               if (checkCartProduct) {
                    const dataDelete = await checkCartProduct.destroy()
                    OK_200(res, dataDelete, 'Delete success from cart')
               }
               else {
                    return NotFound_404(res, "Product exist")
               }
          })
     } catch (error) {
          Server_500(res, error)
     }


}




export {
     addProductCart,
     GETaddProductCart,
     delProductFromCart,
     
}