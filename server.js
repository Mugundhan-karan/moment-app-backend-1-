const dotenv = require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");


const userRoute = require("./routes/userRoute");
const momentsRoute = require("./routes/momentsRoute");
//const errorHandler = require("./middleWare/errorMiddleware");


const app = express();

//Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/uploads", express.static(path.join(__dirname, "uploads")))

//Routes Middlewares
app.use("/api/users", userRoute);
app.use("/api/moments", momentsRoute);


// Routes
app.get("/", (req, res) => {
    res.send("Home Page");
});


//Error Midddleware

//app.use(errorHandler());


//connect db
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(5000, () => {
            console.log('Server Running on port 5000');
        });
    })
    .catch((err) => console.log(err));