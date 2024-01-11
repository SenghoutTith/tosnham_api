const User = require('../models/model')
const Product = require('../models/productModel')
const asyncHandler = require('express-async-handler')
const Payment = require('../models/Payment')
const jwt = require('jsonwebtoken')
const bcryptjs = require('bcryptjs')

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {expiresIn: '1d'})
}

// const getUserEmail = asyncHandler ( async (req, res) => {
//     try {
//         const { email } = req.body
//         const existedUser = await User.findOne({email})
//         if(existedUser){
//             res.status(404).json({message: "Email does not exist"})
//         }else{
//             res.status(200).json({message: "Email is already exists"})
//         }
//     } catch (error) {
//         res.status(400)
//         throw new Error("User is empty")
//     }
// })

const getUser = asyncHandler ( async (req, res) => {
    try {
        const user = await User.find()
        res.status(200).json(user)
    } catch (error) {
        res.status(400)
        throw new Error("User is empty")
    }
})
    
const registerUser = asyncHandler ( async (req, res) => {
    try {
        const {name, email, password, phonenumber} = req.body

        if(!name || !email || !password || !phonenumber){
            res.status(400)
            throw new Error("Please input all fields")
        }

        const user = await User.findOne({email})

        if(user){
            res.status(400)
            throw new Error("Email is already exist") 
        }

        if(!email.endsWith("@gmail.com")){
            res.status(400)
            throw new Error("Only accept gmail account")
        }

        if(password.length < 6){
            res.status(400)
            throw new Error("Password must be at least 6 characters")
        }

        const newUser = await User.create({name, email, password, phonenumber})
        const token = generateToken(newUser._id)
        if(newUser){
            const {_id, name, email, password, phonenumber, photo, role, street, city} = newUser
            res.cookie("token", token, {
                path: "/",
                httpOnly: true,
                expires: new Date(Date.now() + 1000 * 86400), // set expire to 1day after created new user
                sameSite: "none",
                secure: true
            })
            res.status(201).json({_id, name, email, phonenumber, photo, role, street, city, token})
        }else{
            res.status(401)
            throw new Error("Invalid user data")
        }
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }
})

const loginUser = asyncHandler ( async (req, res) => {
    const {email, password} = req.body
    try {
        if(!email || !password){
            res.status(400)
            throw new Error("Please input email and password")
        }
        const user = await User.findOne({ email });
        if (!user) {
            res.status(404)
            throw new Error("email not found, please sign up...") 
        }
        const isPasswordCorrect = await bcryptjs.compare(password, user.password)
        const token = generateToken(user._id)
        if (user && isPasswordCorrect) {
            res.cookie("token", token, {
                path: "/",
                httpOnly: true,
                expires: new Date(Date.now() + 1000 * 86400), // set expire to 1day after created new user
                sameSite: "none",
                secure: true
            })
            res.status(200).json(user)
        } else {
            res.status(400);
            throw new Error("Invalid emial or password...");
        }
      } catch (error) {
        res.status(500)
        throw new Error(error.message)
      }
})

const logoutUser = asyncHandler ( async (req, res) => {
    try {
        res.cookie("token", "", {
            path: "/",
            httpOnly: true,
            expires: new Date(0), // set expire to now
            sameSite: "none",
            secure: true
        })
        res.status(200).json({message: "Logout success..."})
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }
})

const getUserProfile = asyncHandler ( async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password")
        res.status(200).json(user)
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }
})

const getUserLoggin = asyncHandler ( async (req, res) => {
    try {
        const token = req.cookies.token
    if(!token){
        return res.send(false)
    }
    const verifyToken = jwt.verify(token, process.env.JWT_SECRET)
    if(verifyToken){
        res.send(true)
    }else{
        res.send(false)
    }
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }
})

const updateUser = asyncHandler ( async (req, res) => {
    try {
        const {name, password, phonenumber, street, city, brand } = req.body
        const user = await User.findById(req.user._id)
        if(!user){
            res.status(404)
            throw new Error("User not found...")
        }
        if(user){
            user.brand = brand || user.brand
            user.name = name || user.name
            user.password = password || user.password
            user.phonenumber = phonenumber || user.phonenumber
            user.street = street || user.street
            user.city = city || user.city
            const updatedUser = await user.save()
            res.status(200).json(updatedUser)
        }
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }
})

const updateUserPhoto = asyncHandler (async (req, res) => {
    try {
        const { photo } = req.body
        const user = await User.findById(req.user._id)
        if(!user){
            res.status(404)
            throw new Error("User not found...")
        }
        if(user){
            user.photo = photo || user.photo
            const updatedUser = await user.save()
            res.status(200).json(updatedUser)
        }
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }
})

const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "email not found, please sign up..." }); // 404 for not found
        } else{
            const newUser = await User.create({email, password})
            if(newUser){
                const {_id, email, password} = newUser
                res.status(200).json({_id, email, password})
            }else{ 
                res.status(400).json({message: "Invaid user data"})   
            }
        }
    }catch(error){
        res.status(500).json({message: error})
    }
}

const addToCart = asyncHandler ( async (req, res) => {
    const { productId } = req.body;
    if (!productId) {
        res.status(400).json({ message: "productId is missing in the request" });
        return;
    }
    try {
        const user = await User.findById(req.user._id);
        const product = await Product.findById(productId);

        if (!user || !product) {
            res.status(404).json({ message: "User or product not found" });
            return;
        }

        // Check if the product already exists in the user's cart
        const existCartItem = user.cart.items.find(item => item.productId.equals(productId));

        if (existCartItem) {

            // If the product exists, update the quantity and total
            existCartItem.amount++;
            existCartItem.total += product.price;

            user.cart.totalAmount++;
            user.cart.totalPrice += product.price;

            await user.save();

            res.status(201).json({ message: "Product has been added to cart" });
        } else {
            // If the product does not exist, add a new item to the cart
            const newCartItem = {
                productId,
                amount: 1,
                description: product.description,
                brand: product.brand,
                total: product.price ,
                price: product.price,
                name: product.name,
                image: product.image,
            };

            user.cart.items.push(newCartItem);

            user.cart.totalAmount++;
            user.cart.totalPrice += product.price;

            await user.save();

            res.status(201).json({ message: "Product added to cart" });
        }
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }
})

//increase cart item amount
const increaseCartItemAmount = asyncHandler ( async (req, res) => {

    const { productId } = req.body;

    try {
        const user = await User.findById(req.user._id);
        const product = await Product.findById(productId);

        if (!user || !product) {
            res.status(404).json({ message: "User or product not found" });
            return;
        }

        // Check if the product already exists in the user's cart
        const existCartItem = user.cart.items.find(item => item.productId.equals(productId));

        if (existCartItem) {

            // If the product exists, update the quantity and total
            existCartItem.amount++;
            existCartItem.total += product.price;

            user.cart.totalAmount++;
            user.cart.totalPrice += product.price;

            await user.save();

            res.status(201).json({ message: "Product amount has been increased" });
        } else {
            res.status(404).json({ message: "Product not found in cart" });
        }
    } catch (error) {
        res.status(500)
        throw new Error(error.message)
    }
})

//decrease cart item amount
const decreaseCartItemAmount = asyncHandler(async (req, res) => {
    const { productId } = req.body;

    try {
        const user = await User.findById(req.user._id);
        const product = await Product.findById(productId);

        if (!user || !product) {
            res.status(404).json({ message: "User or product not found" });
            return;
        }

        // Check if the product already exists in the user's cart
        const existCartItem = user.cart.items.find((item) =>
            item.productId.equals(productId)
        );

        if (existCartItem) {
            // If the product exists, update the quantity and total
            existCartItem.amount--;

            // Check if the amount is zero, and if so, remove the item
            if (existCartItem.amount === 0) {
                user.cart.items = user.cart.items.filter(
                    (item) => !item.productId.equals(productId)
                );
            } else {
                existCartItem.total -= product.price;
            }

            user.cart.totalAmount--;
            user.cart.totalPrice -= product.price;

            await user.save();

            res.status(201).json({ message: "Product amount has been decreased" });
        } else {
            res.status(404).json({ message: "Product not found in cart" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//delete item in cart
const deleteCartItem = asyncHandler ( async (req, res) => {
    
        const { id } = req.params
    
        try {
            const user = await User.findById(req.user._id);
            const product = await Product.findById(id);
    
            if (!user || !product) {
                res.status(404).json({ message: "User or product not found" });
                return;
            }
    
            // Check if the product already exists in the user's cart
            const existCartItem = user.cart.items.find(item => item.productId.equals(id));
    
            if (existCartItem) {
    
                // If the product exists, update the quantity and total
                user.cart.items.pull(existCartItem._id);
    
                user.cart.totalAmount -= existCartItem.amount;
                user.cart.totalPrice -= existCartItem.total;
    
                await user.save();
    
                res.status(201).json({ message: "Product has been deleted from cart" });
            } else {
                res.status(404).json({ message: "Product not found in cart" });
            }
        } catch (error) {
            res.status(500)
            throw new Error(error.message)
        }
    }
)

//payment
const payment = asyncHandler(async (req, res) => {
    try {

        const paymentOption = req.body.paymentOption;

        if (!paymentOption || !['cashOnDelivery', 'ABA', 'Acleda'].includes(paymentOption)) {
            res.status(400)
            throw new Error("Invalid payment option");
        }

        const user = await User.findById(req.user._id);

        const { cart } = user;

        const brands = new Set();

        cart.items.forEach(item => brands.add(item.brand));

        if (brands.size > 1) {
            res.status(400)
            throw new Error("Cart should contain from one brand only")
        }

        // Assuming the first product's brand is the same for all items in the cart
        const firstProduct = cart.items[0];
        const brand = firstProduct.brand;

        //find brand owner accroiding to brand
        const brandOwner = await User.findOne({ brand: brand });

        if (!brandOwner) {
            // Handle the case where no user is found for the specified brand
            res.status(404)
            throw new Error("Brand owner not found for the specified brand");
        }

        // Create the payment
        const createdPayment = await Payment.create({
            brand: brand,
            user:{
                _id: user._id,
                name: user.name,
                email: user.email,
                phonenumber: user.phonenumber,
                street: user.street,
                city: user.city,
            },
            status: 'pending',
            product: cart.items,
            paymentOption: paymentOption,
            totalAmount: cart.totalAmount,
            totalPrice: cart.totalPrice + 1,
        });
        
        // Add the order to the brand's orders
        brandOwner.orders.push({ 
            data: createdPayment,
            orderID: createdPayment._id,
            date: createdPayment.createdAt
        });
        await brandOwner.save();

        user.history.push({ 
            data: createdPayment, 
            orderID: createdPayment._id,
            date: createdPayment.createdAt 
        });
        await user.save();

        //empty cart
        user.cart = { items: [], totalAmount: 0, totalPrice: 0 };
        await user.save();

        res.status(200).json({ message: 'Payment successful' });
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
});

//update payment status
const updatePaymentStatus = asyncHandler(async (req, res) => {
    try {
        const { _id, status } = req.body;

        if (!_id || !status) {
            res.status(400)
            throw new Error("paymentId or status is missing in the request");
        }

        const payment = await Payment.findById(_id);

        if (!payment) {
            res.status(404)
            throw new Error("Payment not found");
        }

        // Update user history payment status
        const user = await User.findById(payment.user[0]._id);

        user.history.forEach(order => {
            if (order.data._id.equals(_id)) {
                if (['pending', 'accept', 'cancel'].includes(status)) {
                    order.data.status = status;
                    user.markModified('history');
                    
                }
            }
        });
        await user.save();

        // If the payment user is the brand owner, update the brand owner's order status as well
        const brandOwner = await User.findById(req.user._id);

        brandOwner.orders.forEach(async (order, index) => {
            if (order.data._id.equals(_id)) {
                const update = {};
                update[`orders.${index}.data.status`] = status;
                await User.findOneAndUpdate({ _id: req.user._id }, { $set: update });
                if (status === 'success') {
                    brandOwner.product.totalSold += order.data.totalAmount;
                    brandOwner.product.totalAmount += order.data.totalPrice - 1;
                    brandOwner.markModified('product');
                    await brandOwner.save();
                }
            }
        });

        if (['pending', 'accept', 'cancel'].includes(status) || (req.user._id === brandOwner._id && status === 'success')) {
            payment.status = status;
            await payment.save();
        }

        res.status(200).json({ message: "Payment status updated" });
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
});

// Transfer payment to a free delivery man
const transferPaymentToDeliveryMan = asyncHandler(async (req, res) => {
    try {
        const { freakId, deliveryManId } = req.body;

        console.log(freakId, deliveryManId);

        if (!freakId || !deliveryManId) {
            res.status(400);
            throw new Error("Payment ID or Delivery Man Id is missing");
        }

        const payment = await Payment.findById(freakId);

        if (!payment) {
            res.status(404);
            throw new Error("Payment not found");
        }

        //push payment to that delivery man id
        const deliveryMan = await User.findById(deliveryManId);

        if (!deliveryMan) {
            res.status(404);
            throw new Error("Delivery man not found");
        }

        //push payment to deliveryman data
        if(deliveryMan){
            deliveryMan.delivery.push({
                data: payment
            })
        }
        
        // Update user history payment status
        const user = await User.findById(payment.user[0]._id);

        user.history.forEach(order => {
            if (order.data._id.equals(freakId)) {
                order.data.status = 'delivery';
                user.markModified('history');
            }
        })

        //update payment status
        payment.status = 'delivery';

        await deliveryMan.save();
        await user.save();
        await payment.save();


        res.status(200).json({ message: "Payment transferred to a delivery man successfully" });
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
});

//add on selected payment to delivery man
const updatePayMentStatusByDeliveryMan = asyncHandler(async (req, res) => {
    try {
        const { _id, status } = req.body;

        if (!_id || !status) {
            res.status(400)
            throw new Error("Id or status is missing");
        }

        const payment = await Payment.findById(_id);

        if (!payment) {
            res.status(404)
            throw new Error("Payment not found");
        }

        // Update user history payment status
        const user = await User.findById(payment.user[0]._id);

        user.history.forEach(order => {
            if (order.data._id.equals(_id)) {
                order.data.status = status;
                user.markModified('history');
            }
        });

        //update delivery order staus
        const deliveryMan = await User.findById(req.user._id);

        deliveryMan.delivery.forEach(order => {
            if (order.data && order.data._id && order.data._id.equals(_id)) {
                order.data.status = status;
                deliveryMan.delivery.totalDelivered = 1
                deliveryMan.delivery.totalEarned = 1
                deliveryMan.delivery[0].totalDelivered += deliveryMan.delivery.totalDelivered;
                deliveryMan.delivery[0].totalEarned += deliveryMan.delivery.totalEarned;
                deliveryMan.markModified('delivery')
            }
        })

        await deliveryMan.save();
        await user.save();
        payment.status = status;
        await payment.save();

        res.status(200).json({ message: "Payment status updated" });
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
});

//update delivery working status
const updateWorkingStatus = asyncHandler(async (req, res) => {
    try {
        const { workingStatus } = req.body;

        if (!workingStatus || !['free', 'busy'].includes(workingStatus)) {
            res.status(400)
            throw new Error("Invalid working status");
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404)
            throw new Error("User not found");
        }

        user.delivery[0].workingStatus = workingStatus;

        await user.save();

        console.log(user.delivery[0].workingStatus);

        res.status(200).json({ message: "Working status updated" });
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
})

//super admin that update will update deliveryman working status
const superAdminUpdateDeliveryManStatus = asyncHandler(async (req, res) => {
    try {
        const { _id, workingStatus } = req.body;

        if (!_id || !workingStatus) {
            res.status(400)
            throw new Error("Plase input all information");
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            res.status(404)
            throw new Error("You're not super admin!");
        }

        //update deliveryman working status using findbyidandupdate
        const deliveryMan = await User.findById(_id);

        if (!deliveryMan) {
            res.status(404)
            throw new Error("Deliveryman not found...")
        }

        deliveryMan.delivery.push({
            workingStatus: workingStatus
        })

        await deliveryMan.save();

        res.status(200).json({ message: "Working status updated" });

    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
})

const superAdminUpdateRole = asyncHandler(async (req, res) => {
    try {
        const { _id, role } = req.body;

        if (!_id || !role) {
            res.status(400)
            throw new Error("Plase input all information");
        }

        const superAdmin = await User.findById(req.user._id);

        if (!superAdmin) {
            res.status(404)
            throw new Error("You're not super admin!");
        }

        const user = await User.findByIdAndUpdate(_id, { role: role });

        if (!user) {
            res.status(404)
            throw new Error("User not found...")
        }

        await user.save();

        res.status(200).json({ message: "Role updated" });
        
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
})

const superAdminAddBrand = asyncHandler ( async (req, res) => {
    try {
        const { _id, brand } = req.body

        if(!_id || !brand){
            res.status(400)
            throw new Error("Plase input all information");
        }

        const superAdmin = await User.findById(req.user._id);

        if (!superAdmin) {
            res.status(404)
            throw new Error("You're not super admin!");
        }

        const user = await User.findById(_id)

        if(!user){
            res.status(400)
            throw new Error("User not found...");
        }

        user.brand = brand

        await user.save()

        res.status(200).json({ message: "Brand updated" });
        
    } catch (error) {
        res.status(500);
        throw new Error(error.message);
    }
})


module.exports = {
    getUser,
    registerUser,
    loginUser,
    logoutUser,
    getUserProfile,
    getUserLoggin,
    updateUser,
    updateUserPhoto,
    // getUserEmail,
    addToCart,
    increaseCartItemAmount,
    decreaseCartItemAmount,
    deleteCartItem,
    payment,
    updatePaymentStatus,
    transferPaymentToDeliveryMan,
    updatePayMentStatusByDeliveryMan,
    updateWorkingStatus,
    superAdminUpdateDeliveryManStatus,
    superAdminUpdateRole,
    superAdminAddBrand
}


