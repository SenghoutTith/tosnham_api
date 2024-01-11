const Payment = require('../models/Payment')
const asyHandler = require('express-async-handler');


const getAllPayment = asyHandler(async (req, res) => {
    const payment = await Payment.find()
    if(payment){
        res.status(200).json(payment)
    }
    else{
        res.status(404)
        throw new Error("No payment found")
    }
})

module.exports = getAllPayment