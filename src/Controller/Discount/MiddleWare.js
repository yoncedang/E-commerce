
import query from "../../Model/Main.js";
import { Server_500, NotFound_404, Unauthorized_401, Forbiden_403, OK_200, Found_422 } from "../../Config/status.repsonse.js";


const checkCode = async (req, res, code) => {

     try {
          const check = await query.discount.findOne({
               where: { code }
          })
          if(check) {
               return Found_422(res, "Code already created")
          }
     } catch (error) {

     }

}