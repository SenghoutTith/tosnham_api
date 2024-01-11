const express = require('express')
const getAllPayment = require('../controllers/paymentRouteController')
const {protect, superAdminOnly} = require('../middlewares/authMiddlewares')
const router = express.Router()

//super admin route
router.route("/").get(protect, superAdminOnly, getAllPayment)

module.exports = router