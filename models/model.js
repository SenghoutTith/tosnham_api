const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please input name"],
    },
    email: {
        type: String,
        required: [true, "Please input email"],
        unique: true,
        trim: true,
        match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, "Please enter a valid email"]
    },
    password: {
        type: String,
        required: [true, "Please input password"],
        minlength: 6,
    },
    brand: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        required: [true],
        default: "customer",
        enum: ["customer", "admin", "deliveryman", "superadmin"],
    },
    phonenumber: {
        type: String,
        required: [true, "Please input phone number"],
        default : "+855 ..."
    },
    street: {
        type: String,
        default: "street..."
    },
    city: {
        type: String,
        default: "city..."
    },
    photo: {
        type: String,
        required: [true, "Please input photo"],
        default: "https://img.freepik.com/free-vector/illustration-businessman_53876-5856.jpg?size=626&ext=jpg&ga=GA1.2.117810677.1701271730&semt=ais",
    },
    cart: {
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true,
                },
                description: {
                    type: String,
                    required: true,
                },
                brand: {
                    type: String,
                    required: true,
                },
                amount: {
                    type: Number,
                    required: true,
                    default: 1,
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
            },
        ],
        totalAmount: {
            type: Number,
            default: 0,
        },
        totalPrice: {
            type: Number,
            default: 0,
        },
    },
    product: {
        products: [
            {
                name: { 
                    type: String, 
                    trim: true 
                },
                price: {
                    type: Number,
                    trim: true
                },
                image: {
                    type: String,
                },
                category: {
                    type: String,
                    trim: true
                },
                description: {
                    type: String,
                    trim: true
                },
                brand: {
                    type: String,
                    trim: true
                },
            },
            {
                timestamps: true,
            }
        ],
        totalAmount: {
            type: Number,
            default: 0,
        },
        totalSold: {
            type: Number,
            default: 0,
        },
    },
    history: [
        {
            data: {
                type: Object,
                default: []
            },
        }
    ],
    orders: [
        {
            data: {
                type: Object,
                default: []
            }
        }
    ],
    delivery: [
        {
            data: {
                type: Object,
                default: []
            },
            workingStatus: {
                type: String,
                default: "free",
                enum: ["free", "busy"],
            },
            rate: {
                type: Number,
                default: 1,
            },
            totalDelivered: {
                type: Number,
                default: 0,
            },
            totalEarned: {
                type: Number,
                default: 0,
            },
        }
    ],
},
{
    timestamps: true
})

userSchema.pre('save', async function(next){

    if(!this.isModified('password')){
        next()
    }

    const salt = await bcryptjs.genSalt(10)
    const hashPassword = await bcryptjs.hash(this.password, salt)
    this.password = hashPassword
    next()
})

const User = mongoose.model('User', userSchema)

module.exports = User