



import { Server_500, NotFound_404, Unauthorized_401, Forbiden_403, OK_200, Found_422 } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";
import { AuthVerifyUser } from "../../Middleware/verifyToken.js";
import { updateQuantityProduct } from "./MiddleWare.js";
import crypto from "crypto"
import qs from "qs"
import moment from "moment-timezone";
import dateFormat from "dateformat";

import { createPaymentUrl } from "./MiddleWare.js";

function sortObject(obj) {
     return Object.keys(obj)
          .sort()
          .reduce((acc, key) => {
               acc[key] = obj[key];
               return acc;
          }, {});
}

const orderItems = async (req, res) => {

     try {
          AuthVerifyUser(req, res, async () => {
               const { user } = req
               const currentUser = await query.USER.findOne({
                    where: { email: user.data.email }
               });

               if (!currentUser) {
                    return NotFound_404(res, "User not found");
               }

               const user_id = currentUser.user_id;
               const checkout = await query.checkout.findOne({
                    where: { user_id }
               });

               if (!checkout) {
                    return NotFound_404(res, "Checkout not found");
               }

               const { note } = req.body;
               const { shipping, payment_method } = req.query;

               if (!shipping && !payment_method) {
                    return NotFound_404(res, "Shipping and Payment methods must be provided");
               }
               const checkAddress = await query.shipping.findOne({
                    where: { shipping_id: shipping }
               })
               if (!checkAddress) {
                    return NotFound_404(res, "Address shipping not found")
               }
               const checkPay_Methods = await query.payment_methods.findOne({
                    where: { payment_id: payment_method }
               })
               if (!checkPay_Methods) {
                    return NotFound_404(res, "Not found methods")
               }
               const orderProduct = await query.ORDER.create({
                    total: checkout.totalPrice,
                    shipping_id: shipping,
                    note,
                    payment_id: payment_method
               });
               if (!orderProduct) {
                    return Server_500(res, "Error creating order");
               }
               const userCart = await query.cart.findAll({
                    where: { user_id }
               });

               if (!userCart || userCart.length === 0) {
                    return NotFound_404(res, "Cart is empty!!!");
               }
               const orderHistory = userCart.map(cartProduct => ({
                    product_id: cartProduct.product_id,
                    quantity: cartProduct.quantity,
                    price: cartProduct.price,
                    totalPrice: cartProduct.totalprice,
                    user_id: cartProduct.user_id,
                    status: "pending",
                    discount_id: checkout.discount_id
               }));

               if (checkPay_Methods.payment_name == "COD") {
                    await query.orderHistory.bulkCreate(
                         orderHistory,
                    );
                    await query.cart.destroy({
                         where: { user_id }
                    });

                    await query.checkout.destroy({
                         where: { user_id }
                    });
                    await updateQuantityProduct(user_id)
               }
               const abc = await createPaymentUrl(orderProduct.order_id, orderProduct.total)

               OK_200(res, abc, "Order success");
          });
     } catch (error) {
          Server_500(res, error);
     }
};



export {
     orderItems
}