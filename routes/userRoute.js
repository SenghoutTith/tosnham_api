const express = require('express')
const { getUser, registerUser, loginUser, logoutUser,
     getUserProfile, getUserLoggin, updateUser, updateUserPhoto, addToCart, decreaseCartItemAmount, increaseCartItemAmount, deleteCartItem, payment, updatePaymentStatus, transferPaymentToDeliveryMan, updatePayMentStatusByDeliveryMan, updateWorkingStatus, superAdminUpdateDeliveryManStatus, superAdminUpdateRole, superAdminAddBrand } = require('../controllers/routeController')
const {protect, superAdminOnly, adminOnly, deliveryManOnly} = require('../middlewares/authMiddlewares')
const router = express.Router()

router.route("/").get(getUser)
//login and logout route
router.route("/login").post(loginUser)
router.route("/logout").get(logoutUser)
router.route("/register").post(registerUser)
//user route
router.route("/getuserprofile").get(protect, getUserProfile)
router.route("/getuserloggedin").get(protect, getUserLoggin)
router.route("/updateuser").patch(protect, updateUser)
router.route("/updateuserphoto").patch(protect, updateUserPhoto)
// router.route("/getuser").get(getUserEmail)
//cart route
router.route("/add-to-cart").post(protect, addToCart)
router.route("/increase-cart-amount").post(protect, increaseCartItemAmount)
router.route("/decrease-cart-amount").post(protect, decreaseCartItemAmount)
router.route("/delete-cart-items/:id").delete(protect, deleteCartItem)
//payment route
router.route("/payment").post(protect, payment)
router.route("/update-payment-status").patch(protect, adminOnly, updatePaymentStatus)
router.route('/transfer-payment-to-deliveryman').post(protect, adminOnly, transferPaymentToDeliveryMan)
router.route("/update-payment-status-by-deliveryman").patch(protect, deliveryManOnly, updatePayMentStatusByDeliveryMan)
router.route('/update-working-status').patch(protect, deliveryManOnly, updateWorkingStatus)
//super admin route
router.route("/update-deliveryman-working-status").post(protect, superAdminOnly, superAdminUpdateDeliveryManStatus)
router.route('/update-user-role').patch(protect, superAdminOnly, superAdminUpdateRole)
router.route('/add-brand').post(protect, superAdminOnly, superAdminAddBrand)

module.exports = router