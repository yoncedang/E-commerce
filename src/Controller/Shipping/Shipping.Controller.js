


import { Server_500, NotFound_404, Unauthorized_401, Forbiden_403, OK_200, Found_422 } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";
import { AuthVerifyUser } from "../../Middleware/verifyToken.js";



const new_ShippingAddress = async (req, res) => {
     try {
          AuthVerifyUser(req, res, async () => {
               const { data } = req.user;
               const { email } = data
               const currentUser = await query.USER.findOne({
                    where: { email }
               })
               if (!currentUser) {
                    return NotFound_404(res, "User not found")
               }
               const { fullname, phone, city, district, ward, address } = req.body
               if (!fullname || !phone || !city || !district || !ward || !address) {
                    return NotFound_404(res, "Fullname, phone and information must includes")
               }
               const addNewAddess = await query.shipping.create({
                    fullname,
                    phone,
                    city,
                    district,
                    ward,
                    address,
                    user_id: currentUser.user_id
               })

               OK_200(res, addNewAddess, "Add new Address success")

          })
     } catch (error) {
          Server_500(res, error)
     }

}

const edit_ShippingAddress = async (req, res) => {
     try {
          AuthVerifyUser(req, res, async () => {
               const { data } = req.user;
               const { email } = data
               const currentUser = await query.USER.findOne({
                    where: { email }
               })
               if (!currentUser) {
                    return NotFound_404(res, "User not found")
               }

               const { AddressID } = req.query
               if (!AddressID) {
                    return NotFound_404(res, "Select an address to edit")
               }

               const checkAddress = await query.shipping.findOne({
                    where: { shipping_id: AddressID }
               })
               if (!checkAddress) {
                    return NotFound_404(res, "Address not found")
               }

               const { fullname, phone, city, district, ward, address } = req.body
               const updateAddress = await checkAddress.update({
                    fullname,
                    phone,
                    city,
                    district,
                    ward,
                    address
               })

               OK_200(res, updateAddress, "Update success")
          })
     } catch (error) {
          Server_500(res, error)
     }

}

const del_ShippingAddress = async (req, res) => {
     try {
          AuthVerifyUser(req, res, async () => {
               const { data } = req.user;
               const { email } = data
               const currentUser = await query.USER.findOne({
                    where: { email }
               })
               if (!currentUser) {
                    return NotFound_404(res, "User not found")
               }

               const { AddressID } = req.query
               if (!AddressID) {
                    return NotFound_404(res, "Select an address to Delete")
               }

               const checkAddress = await query.shipping.findOne({
                    where: { shipping_id: AddressID }
               })
               if (!checkAddress) {
                    return NotFound_404(res, "Address not found")
               }

               await checkAddress.destroy()

               OK_200(res, `Delete success: ${AddressID}`)
          })
     } catch (error) {
          Server_500(res, error)
     }

}

const all_ShippingAddress = async (req, res) => {

     try {
          AuthVerifyUser(req, res, async () => {
               const { data } = req.user;
               const { email } = data
               const currentUser = await query.USER.findOne({
                    where: { email }
               })
               if (!currentUser) {
                    return NotFound_404(res, "User not found")
               }

               const allAdress = await query.shipping.findAll({
                    where: { user_id: currentUser.user_id }
               })
               if (allAdress.length < 1) {
                    return NotFound_404(res, "Address is empty !!!")
               }
               else {
                    return OK_200(res, allAdress, "All address")
               }
          })
     } catch (error) {
          Server_500(res, error)
     }
}



export {
     new_ShippingAddress,
     edit_ShippingAddress,
     del_ShippingAddress,
     all_ShippingAddress
}