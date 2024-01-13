const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const cors = require('cors')
const dotenv = require('dotenv').config()
const colors = require('colors')
const cookieParser = require('cookie-parser');

const router = require('./routes/userRoute')
const routerProduct = require('./routes/productRoute')
const routerPayment = require('./routes/paymentRoute')

const connectDB = require('./configs/dataDB')
const errorHandler = require('./middlewares/errorHandlers')
const port =  5001

const corsOptions = {
    origin: [process.env.Frontend || "https://tos-nham.vercel.app"],
    credentials: true,
    exposedHeaders: ["set-cookie"],
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

connectDB()

const app = express()

// Set security headers
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'https://tos-nham.vercel.app');
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
  });

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors(corsOptions))
app.use(cookieParser())

app.use("/api/user", router)
app.use("/api/product", routerProduct)
app.use("/api/payment", routerPayment)

app.use(errorHandler)

app.listen(port, () => {
    console.log(`Server is running on port ${port}`.blue.underline.bold)
})