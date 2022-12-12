const mongoose = require("mongoose");

const momentsSchema = mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User",
    },
    title: {
        type: String,
        required: [true, "Please add a title "],
        trim: true,

    },
    tags: {
        type: String,
        required: [true, "Please add a tag"],
        trim: true,
    },
    image: {
        type: Object,
        default: {}
    },
},
    {
        timestamps: true,


    });






const Moments = mongoose.model("Moments", momentsSchema);
module.exports = Moments;