const asyncHandler = require("express-async-handler");
const jwt = require("jsonwebtoken");
const User = require("../models/model")

const protect = asyncHandler ( async (req, res, next) => {
    try {
        const token = req.cookies.token

        if(!token){
            res.status(400).json({message: "Please login or register..."})
        }

        const verifyToken = jwt.verify(token, process.env.JWT_SECRET)

        const user = await User.findById(verifyToken.id).select("-password")

        if(!user){
            res.status(400)
            throw new Error("User not found...")
        }

        if(user){
            req.user = user
            next()
        }
    } catch (error) {
        res.status(500)
        throw new Error(error)
    }
})

const adminOnly = (req, res, next) => {
        if(req.user && req.user.role === "admin"){
            next()
        }
        else{
            res.status(500)
            throw new Error("Not authorized as an admin")
        }
}

const deliveryManOnly = (req, res, next) => {
    if(req.user && req.user.role === "deliveryman"){
        next()
    }
    else{
        res.status(500)
        throw new Error("Not authorized as a deliveryman")
    }
}

const superAdminOnly = (req, res, next) => {
    if(req.user && req.user.role === "superadmin"){
        next()
    }
    else{
        res.status(500)
        throw new Error("Not authorized as Super Admin")
    }
}

module.exports = {
    protect, 
    adminOnly,
    deliveryManOnly,
    superAdminOnly
}