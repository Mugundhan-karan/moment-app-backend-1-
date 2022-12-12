const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add a name"],

    },
    phone: {
        type: String,
        default: "+91"

    },
    email: {
        type: String,
        required: [true, "Please add a Email"],
        unique: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please enter a valid email",
        ],
    },
    password: {
        type: String,
        required: [true, "Please add a password"],
        minLengtn: [6, "Password must be upto 6 characters"],
        //maxLengtn: [23, "Password must not be more than 23 characters"],


    },
    photo: {
        type: String,
        required: [true, "Please add your photo"],
        default: "https://i.ibb.co/4pDNDk1/avatar.png"

    },



}, {
    timestamps: true,
})

const User = mongoose.model("User", userSchema)

module.exports = User