const asyHandler = require('express-async-handler');
const Product = require('../models/productModel');
const User = require('../models/model');
const mongoose = require('mongoose');

const getAllProduct = asyHandler(async (req, res) => {
    const products = await Product.find()
    if(products){
        res.status(200).json(products)
    }
    else{
        res.status(404)
        throw new Error("No products found")
    }
})

const createProduct = async (req, res) => {
    const { name, price, image, brand, category, description } = req.body;

    if (!name || !price || !image || !category || !description) {
        res.status(400).json({ error: "Please fill all fields" });
        return;
    }

    try {
        const productData = {
            name,
            price,
            image,
            brand,
            category,
            description,
        };

        // Create a global product
        const globalProduct = await Product.create(productData);

        // Assuming you have the admin's user ID available in req.user.id
        const adminId = req.user.id;

        // Create a user-specific product
        const userSpecificProduct = await User.findByIdAndUpdate(
            adminId,
            {
                $push: { "product.products": globalProduct },
            },
            { new: true }
        );

        res.status(201).json({ success: true, globalProduct, userSpecificProduct });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const getProductById = asyHandler(async (req, res) => {
    const {id} = req.params
    const product = await Product.findById(id)
    if(!product){
        res.status(404)
        throw new Error("Product not found...")
    }
    if(product){
        res.status(200).json(product)
    }
})

const deleteProduct = asyHandler (async (req, res) => {

    const { id } = req.params;

    try {

        const product = await Product.findByIdAndDelete(id);

        if (!product) {
            res.status(404)
            throw new Error("Product not found...")
        }

        await User.updateMany(
            {},
            {
                $pull: {
                    "product.products": { _id: id },
                    "cart.items": { productId: id },
                },
            }
        );

        res.status(200).json({ product, message: "Product deleted successfully..." });
    } catch (error) {
        console.error(error);
        res.status(500)
        throw new Error(error.message)
    }
});

const updateProduct = async (req, res) => {

    const { id } = req.params;

    try {
        // Update the global product
        const product = await Product.findByIdAndUpdate(id, req.body);

        if (!product) {
            res.status(404).json({ message: "Product not found..." });
            return;
        }

        // Retrieve the updated product
        const updatedProduct = await Product.findById(id);

        // Update the product reference in all user accounts
        await User.updateMany({ "cart.items.productId": id }, { $set: { "cart.items.$": updatedProduct } });
        await User.updateMany({ "product.products._id": id }, { $set: { "product.products.$": updatedProduct } });

        res.status(200).json({ updatedProduct, message: "Product updated successfully..." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { 
    getAllProduct,
    createProduct,
    getProductById,
    deleteProduct,
    updateProduct,
}