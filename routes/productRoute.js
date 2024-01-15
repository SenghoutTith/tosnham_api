const express = require('express')
const {protect, adminOnly} = require('../middlewares/authMiddlewares')
const { createProduct, getAllProduct, getProductById, deleteProduct, updateProduct } = require('../controllers/productRouteController')

const router = express.Router()

router.route("/").get(getAllProduct)
router.route("/").post(protect, adminOnly, createProduct)
router.route("/:id").get(getProductById)
router.route("/delete/:id").delete(protect, adminOnly, deleteProduct)
router.route("/update/:id").put(protect, adminOnly, updateProduct)
module.exports = router