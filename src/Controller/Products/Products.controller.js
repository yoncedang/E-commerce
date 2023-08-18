



import { Server_500, OK_200, NotFound_404, Found_422, Unauthorized_401, Forbiden_403 } from "../../Config/status.repsonse.js";
import query from "../../Model/Main.js";
import { searchProducts, Middle_DeleteProducts } from "./Middleware.product.js";
import { PutObjectCommand, S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import sharp from 'sharp'
import { AuthVerifyAdmin } from "../../Middleware/verifyToken.js";

const All_Products = async (req, res) => {
     try {
          const results = await query.Products.findAll({
               include: [
                    {
                         model: query.Categories,
                         as: "category"
                    }
               ]
          })
          OK_200(res, results, 'All products')
     } catch (error) {
          Server_500(res, error)
     }
}

const Navigation_Products = async (req, res) => {

     try {
          const size = 15
          const { page } = req.query;
          if (isNaN(page)) {
               return Unauthorized_401(res, 'Please input page number')
          }
          const offset = (page - 1) * size;

          const totalProducts = await query.Products.count();
          const totalPages = Math.ceil(totalProducts / size)

          const data = await query.Products.findAll({
               limit: size,
               offset: offset
          })

          const results = {
               totalProducts,
               totalPages,
               currentPage: +page,
               products: data
          }
          OK_200(res, results, `Current Page: ${page}`)

     } catch (error) {
          Server_500(res, error)
     }

}


const search_Products = async (req, res) => {

     try {
          const { search, searchBy, from, to } = req.query;
          if (!search) {
               return NotFound_404(res, "Search is required")
          }

          const results = await searchProducts(search, searchBy, from, to)

          if (results.length > 0) {
               return OK_200(res, results, 'Search success !!!')
          }
          else {
               return NotFound_404(res, "Product not found")
          }
     } catch (error) {
          Server_500(res, error)
     }

}


const del_Products = async (req, res) => {

     try {
          const { product } = req.query;
          if (isNaN(product)) {
               return NotFound_404(res, 'Product not found')
          }

          const checkProduct = await query.Products.findOne({
               where: { product_id: product }
          })

          if (!checkProduct) {
               return NotFound_404(res, 'Product not found')
          }

          const results = await Middle_DeleteProducts(product)
          OK_200(res, results, `Delete Success Products: ${checkProduct.product_name}`)

     } catch (error) {
          Server_500(res, error)
     }

}


const add_Products = async (req, res) => {

     try {
          const file = req.file;
          if (!file) {
               return NotFound_404(res, 'Please select an image. FILE is required')
          }

          else {
               const { mimetype, buffer } = file
               const imageSharp = await sharp(buffer)
                    .jpeg({ quality: 75 })
                    .toBuffer()
               // Step 2: The s3Client function validates your request and directs it to your Space's specified endpoint using the AWS SDK.
               const s3Client = new S3Client({
                    endpoint: "https://sgp1.digitaloceanspaces.com", // Find your endpoint in the control panel, under Settings. Prepend "https://".
                    forcePathStyle: false, // Configures to use subdomain/virtual calling format.
                    region: "sgp1", // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (e.g. nyc3).
                    credentials: {
                         accessKeyId: "DO00XKDQMQDA6YAJQNH9", // Access key pair. You can create access key pairs using the control panel or API.
                         secretAccessKey: process.env.SPACES_SECRET // Secret access key defined through an environment variable.
                    }
               });

               // Step 3: Define the parameters for the object you want to upload.
               const params = {
                    Bucket: "dbecommerce", // The path to the directory you want to upload the object to, starting with your Space name.
                    Key: "img/" + new Date().getTime() + mimetype.substring(mimetype.lastIndexOf("/")).replace("/", "."), // Object key, referenced whenever you want to access this file later.
                    Body: imageSharp, // The object's contents. This variable is an object, not a string.
                    ACL: "public-read-write", // Defines ACL permissions, such as private or public.
                    ContentType: mimetype
               };

               AuthVerifyAdmin(req, res, async () => {

                    const { data } = req.user;
                    const { email } = data

                    const dataSpaces = new PutObjectCommand(params);
                    await s3Client.send(dataSpaces)
                    const downloadURL = "https://dbecommerce.sgp1.digitaloceanspaces.com" + params.Key;

                    const categoryMapping = {
                         Shoe: 2,
                         Bag: 3,
                         Clothes: 4,
                         Accessory: 6
                    }
                    const checkAdmin = await query.USER.findOne({
                         where: { email }
                    })

                    if (!checkAdmin) {
                         return NotFound_404(res, 'User not found')
                    }

                    const { product_name, desc, price, quality_stock, category_id } = req.body;

                    const addProduct = await query.Products.create({
                         product_name,
                         desc,
                         price,
                         quality_stock,
                         category_id: categoryMapping[category_id],
                         img: downloadURL,
                         addByUser: checkAdmin.user_id
                    })

                    OK_200(res, addProduct, `Add success Product: ${product_name}`)
               })
          }
     } catch (error) {
          Server_500(res, error)
     }
}


const edit_Products = async (req, res) => {

     try {
          AuthVerifyAdmin(req, res, async () => {
               const { data } = req.user;
               const { email } = data
               const checkAdmin = await query.USER.findOne({
                    where: { email }
               })

               if (checkAdmin) {
                    const { product } = req.query
                    const { product_name, price, desc, quality_stock, category_id } = req.body
                    const file = req.file;


                    const { mimetype, buffer } = file
                    const imageSharp = await sharp(buffer)
                         .jpeg({ quality: 75 })
                         .toBuffer()
                    // Step 2: The s3Client function validates your request and directs it to your Space's specified endpoint using the AWS SDK.
                    const s3Client = new S3Client({
                         endpoint: "https://sgp1.digitaloceanspaces.com", // Find your endpoint in the control panel, under Settings. Prepend "https://".
                         forcePathStyle: false, // Configures to use subdomain/virtual calling format.
                         region: "sgp1", // Must be "us-east-1" when creating new Spaces. Otherwise, use the region in your endpoint (e.g. nyc3).
                         credentials: {
                              accessKeyId: "DO00XKDQMQDA6YAJQNH9", // Access key pair. You can create access key pairs using the control panel or API.
                              secretAccessKey: process.env.SPACES_SECRET // Secret access key defined through an environment variable.
                         }
                    });

                    // Step 3: Define the parameters for the object you want to upload.
                    const params = {
                         Bucket: "dbecommerce", // The path to the directory you want to upload the object to, starting with your Space name.
                         Key: "img/" + new Date().getTime() + mimetype.substring(mimetype.lastIndexOf("/")).replace("/", "."), // Object key, referenced whenever you want to access this file later.
                         Body: imageSharp, // The object's contents. This variable is an object, not a string.
                         ACL: "public-read-write", // Defines ACL permissions, such as private or public.
                         ContentType: mimetype
                    };

                    const categoryMapping = {
                         Shoe: 2,
                         Bag: 3,
                         Clothes: 4,
                         Accessory: 6
                    }
                    if (!file) {

                         const updateProduct = await query.Products.update({
                              product_name,
                              price,
                              desc,
                              quality_stock,
                              category_id: categoryMapping[category_id],
                              addByUser: checkAdmin.user_id
                         }, { where: { product_id: product } })
                         OK_200(res, updateProduct, "Update success")

                    }
                    else {
                         const dataSpaces = new PutObjectCommand(params);
                         await s3Client.send(dataSpaces)
                         const downloadURL = "https://dbecommerce.sgp1.digitaloceanspaces.com" + params.Key;

                         const existingProduct = await query.Products.findOne({
                              where: { product_id: product }
                         })
                         if (existingProduct.img) {
                              const oldImageKey = existingProduct.img.substring(existingProduct.img.lastIndexOf("/")).replace("/", "");
                              const deleteParams = {
                                   Bucket: "dbecommerce",
                                   Key: "img/" + oldImageKey
                              };
                              await s3Client.send(new DeleteObjectCommand(deleteParams));
                         }
                         const updateData = {
                              product_name,
                              price,
                              desc,
                              quality_stock,
                              img: downloadURL,
                              category_id: categoryMapping[category_id],
                              addByUser: checkAdmin.user_id
                         }
                         const updateProduct = await query.Products.update(updateData, {
                              where: { product_id: product }
                         });
                         OK_200(res, updateProduct, 'Upload full success')
                    }
               }
               else {
                    return NotFound_404(res, 'Admin not found!')
               }
          })
     } catch (error) {
          Server_500(res, error)
     }
}


export {
     All_Products,
     Navigation_Products,
     search_Products,
     edit_Products,
     del_Products,
     add_Products
}