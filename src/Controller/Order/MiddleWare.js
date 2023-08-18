import { NotFound_404, Server_500 } from "../../Config/status.repsonse.js"
import query from "../../Model/Main.js"
import crypto from "crypto"
import qs from "qs"
import moment from "moment-timezone";
import dateFormat from "dateformat";


const updateQuantityProduct = async (user_id) => {
     try {
          const checkHistory = await query.orderHistory.findAll({
               where: { user_id, isProductUpdate: false }
          })

          if (!checkHistory || checkHistory.length === 0) {
               throw new Error("Not found");
          }

          for (const historyItem of checkHistory) {
               const product = await query.Products.findOne({
                    where: { product_id: historyItem.product_id }
               });
               if (!product || product.quantity_stock < historyItem.quantity) {
                    throw new Error("Product not found or SOLD OUT");
               }

               await product.update({
                    quantity_stock: product.quantity_stock - historyItem.quantity,
               });
               await historyItem.update({
                    isProductUpdate: true
               })
          }

          // await Promise.all(checkHistory.map(async (historyItem) => {
          //      const product_id = historyItem.product_id;
          //      const product = await query.Products.findOne({
          //           where: { product_id }
          //      });
          //      if (!product || product.quantity_stock < historyItem.quantity) {
          //           throw new Error("Product not found or SOLD OUT");
          //      }

          //      await product.update({
          //           quantity_stock: product.quantity_stock - historyItem.quantity,
          //      });
          //      await historyItem.update({
          //           isProductUpdate: true
          //      })
          // }))

     } catch (error) {
          console.log(error.message);
     }
}

// const merchantCode = 'VV6SHL4S';
const secretKey = 'CKBIWFGEOXXRSQQPBHWQJILZQSCOWLDQ';
const returnUrl = 'http://localhost:8080/payment/callback'; // Điều chỉnh lại URL của bạn
const apiUrl = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';


function sortObject(obj) {
     return Object.keys(obj)
          .sort()
          .reduce((acc, key) => {
               acc[key] = obj[key];
               return acc;
          }, {});
}


const createPaymentUrl = async (orderInfo, amount) => {
     const date = new Date();
     // Cộng thêm 7 giờ cho múi giờ GMT+7
     date.setHours(date.getHours() + 7);
     const createDate = dateFormat(date, 'yyyymmddHHMMss');

     const vnp_Params = {
          vnp_BankCode: "NCB",
          vnp_Version: '2.0.1',
          vnp_Command: 'pay',
          vnp_TmnCode: 'VV6SHL4S',
          vnp_Locale: 'vn',
          vnp_CurrCode: 'VND',
          vnp_TxnRef: orderInfo,
          vnp_OrderInfo: 'Payment:#' + orderInfo,
          vnp_Amount: Number(amount * 100),
          vnp_ReturnUrl: returnUrl,
          vnp_IpAddr: '127.0.0.1',
          vnp_CreateDate: createDate,
          vnp_SecureHash: '', // Để tạo sau
     };

     // Sắp xếp tham số theo thứ tự từ điển
     const sortedParams = Object.keys(vnp_Params)
          .sort()
          .reduce((result, key) => {
               result[key] = vnp_Params[key];
               return result;
          }, {});
     console.log(sortedParams, "GOOD")
     // Tạo chuỗi dữ liệu cần hash
     const signData = Object.keys(sortedParams)
          .map((key) => key + '=' + sortedParams[key])
          .join('&');
     console.log(signData, "GOOD")
     // Tạo mã hash
     const hmac = crypto.createHmac('sha256', secretKey);
     hmac.update(signData, 'utf-8');
     const secureHash = hmac.digest('hex');
     vnp_Params.vnp_SecureHash = secureHash;

     const paymentUrl = apiUrl + '?' + qs.stringify(vnp_Params, { encode: false });

     return paymentUrl;
}



export {
     updateQuantityProduct,
     createPaymentUrl
}
