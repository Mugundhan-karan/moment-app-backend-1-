const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");




const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" })

};


// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;


    //validation
    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill in all required fields")
    }

    if (password.length < 6) {
        throw new Error("Please must be upto 6 characters")

    }



    // Check if user email already exists
    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("Email has already been registered");
    }


    //Encrypt password before saving to DB
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);




    // Create new user
    const user = await User.create({
        name,
        email,
        password: hashedPassword,
    });

    //Generate Token
    const token = generateToken(user._id)

    //Send HTTP-only request
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: "none",
        secure: true,

    })

    if (user) {
        const { _id, name, email, password, photo, phone, } = user;
        res.status(200).json({
            _id,
            name,
            email,
            password,
            photo,
            phone,
            token,


        });
    } else {
        res.status(400);
        throw new Error("Invalid user data");
    }
});


//Login User

const loginUser = asyncHandler(async (req, res) => {

    const { email, password } = req.body

    //Validate Request
    if (!email || !password) {
        res.status(400);
        throw new Error("Please add Email and Password");
    }

    //Check if user exists

    const user = await User.findOne({ email })

    if (!user) {
        res.status(400);
        throw new Error("User not found, Please sign-up");
    }

    //User exists , check pass is correct

    const passwordIsCorrect = await bcrypt.compare(password, user.password);

    //Generate Token
    const token = generateToken(user._id)

    //Send HTTP-only request
    res.cookie("token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400), // 1 day
        sameSite: "none",
        secure: true,

    })

    if (user && passwordIsCorrect) {
        const { _id, name, email, password, photo, phone, } = user;
        res.status(200).json({
            _id,
            name,
            email,
            password,
            photo,
            phone,
            token,

        });
    }
    else {
        res.status(400);
        throw new Error("Invalid Email or password");
    }





});

//Logout User
const logoutUser = asyncHandler(async (req, res) => {
    res.cookie("token", "", {
        path: "/",
        httpOnly: true,
        expires: new Date(0), // 1 day
        sameSite: "none",
        secure: true,

    });
    return res.status(200).json({ message: "Successfully Logged out" })

});

//GetUSer Data

const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { _id, name, email, photo, phone, } = user;
        res.status(200).json({
            _id,
            name,
            email,
            photo,
            phone,

        });
    } else {
        res.status(400);
        throw new Error("User Not Found");
    }
});


// Get Login Status
const loginStatus = asyncHandler(async (req, res) => {
    const token = req.cookies.token;
    if (!token) {
        return res.json(false);
    }
    // Verify Token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    if (verified) {
        return res.json(true);
    }
    return res.json(false);
});

// Update User
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        const { name, email, photo, phone, } = user;
        user.email = email;
        user.name = req.body.name || name;
        user.phone = req.body.phone || phone;

        user.photo = req.body.photo || photo;

        const updatedUser = await user.save();
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            photo: updatedUser.photo,
            phone: updatedUser.phone,

        });
    } else {
        res.status(404);
        throw new Error("User not found");
    }
});







module.exports =
{
    registerUser,
    loginUser,
    logoutUser,
    getUser,
    loginStatus,
    updateUser,

};