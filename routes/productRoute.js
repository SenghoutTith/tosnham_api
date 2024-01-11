const express = require('express')
const {protect, adminOnly} = require('../middlewares/authMiddlewares')
const { createProduct, getAllProduct, getProductById, deleteProduct, updateProduct, ratingProduct, deleteRatingProduct } = require('../controllers/productRouteController')

const router = express.Router()

router.route("/").get(getAllProduct)
router.route("/").post(protect, adminOnly, createProduct)
router.route("/:id").get(getProductById)
router.route("/delete/:id").delete(protect, adminOnly, deleteProduct)
router.route("/update/:id").put(protect, adminOnly, updateProduct)
router.route("/review/:id").patch(protect, ratingProduct)
router.route("/deleteReview/:id").patch(protect, deleteRatingProduct)
module.exports = router