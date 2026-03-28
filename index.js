require("./config/smtp.js")
require("dotenv").config({quiet:true})
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();
const PORT=process.env.PORT||8001

mongoose.connect(process.env.DB).then(()=>console.log("MongoDb Connected successfully!!!")).catch((err)=>console.log("DB connection failed!!!",err));

app.use(cors())
app.use(express.json());

app.use("/api/user",require("./routes/userRoutes"));


app.listen(PORT,()=>console.log(`Server is listening to localhost:${PORT}`));
