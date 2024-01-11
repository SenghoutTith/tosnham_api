const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    user: {
        type: Array,
        ref: 'User',
        default: [],
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    product: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true,
            },
            amount: {
                type: Number,
                required: true,
                default: 1,
            },
            description:{
                type: String,
                required: true,
            },
            total: {
                type: Number,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            image: {
                type: String,
                required: true,
            },
            brand: {
                type: String,
                required: true,
            },
        },
    ],
    status: {
        type: String,
        default: 'pending',
        enum: ['pending', 'accept', 'delivery', 'success', 'cancel'],
    },
    paymentOption: {
        type: String,
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
},
{ timestamps: true }
);

const Payment = mongoose.model('Payments', paymentSchema);

module.exports = Payment;