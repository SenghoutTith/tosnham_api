const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        trim: true 
    },
    price: {
        type: Number,
        required: [true, "Please add a price"],
        trim: true
    },
    image: {
        type: String,
        required: [true, "Please add an image"],
    },
    category: {
        type: String,
        required: [true, "Please add a category"],
        trim: true
    },
    brand: {
        type: String,
        // required: [true, "Please add a brand"],
        trim: true
    },
    description: {
        type: String,
        required: [true, "Please add a description"],
        trim: true
    },
},
{
    timestamps: true,
})

const Product = mongoose.model('Product', productSchema);

module.exports = Product