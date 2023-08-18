

import dotenv from "dotenv";
dotenv.config();


const sequelize_DB = {
     DATABASE: "ecommerce",
     USERNAME: "root",
     PASSWORD: "1234",
     HOST: "localhost",
     DIALECT: "mysql",
     PORT: 3306,
}


export {
     sequelize_DB
}