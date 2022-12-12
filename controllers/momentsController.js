const asyncHandler = require("express-async-handler");
const Moment = require("../models/momentsModel");

const { fileSizeFormatter } = require("../utils/fileUpload")
const cloudinary = require("cloudinary").v2;

const createMoments = asyncHandler(async (req, res) => {
    const { title, tags } = req.body;

    //validation
    if (!title || !tags) {
        res.status(400);
        throw new error("Please fill all");
    }

    //Manage Image Upload
    let fileData = {}
    if (req.file) {
        fileData = {
            fileName: req.file.originalname,
            filePath: req.file.path,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),
        }
    }


    //Create Moment
    const moments = await Moment.create({
        user: req.user.id,
        title,
        tags,
        image: fileData,

    });
    res.status(201).json(moments)
});

// Get all Moments
const getMoments = asyncHandler(async (req, res) => {
    const Moments = await Moment.find({ user: req.user.id }).sort("-createdAt");
    res.status(200).json(Moments);
});

// Get single Moment
const getMoment = asyncHandler(async (req, res) => {
    const Moment = await Moment.findById(req.params.id);
    // if Moment doesnt exist
    if (!Moment) {
        res.status(404);
        throw new Error("Moment not found");
    }
    // Match Moment to its user
    if (Moment.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error("User not authorized");
    }
    res.status(200).json(Moment);
});

// Delete Moment
const deleteMoment = asyncHandler(async (req, res) => {
    const Moment = await Moment.findById(req.params.id);
    // if Moment doesnt exist
    if (!Moment) {
        res.status(404);
        throw new Error("Moment not found");
    }
    // Match Moment to its user
    if (Moment.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error("User not authorized");
    }
    await Moment.remove();
    res.status(200).json({ message: "Moment deleted." });
});

// Update Moment
const updateMoment = asyncHandler(async (req, res) => {
    const { name, category, quantity, price, description } = req.body;
    const { id } = req.params;

    const Moment = await Moment.findById(id);

    // if Moment doesnt exist
    if (!Moment) {
        res.status(404);
        throw new Error("Moment not found");
    }
    // Match Moment to its user
    if (Moment.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error("User not authorized");
    }

    // Handle Image upload
    let fileData = {};
    if (req.file) {
        // Save image to cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                folder: "Pinvent App",
                resource_type: "image",
            });
        } catch (error) {
            res.status(500);
            throw new Error("Image could not be uploaded");
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),
        };
    }

    // Update Moment
    const updatedMoment = await Moment.findByIdAndUpdate(
        { _id: id },
        {
            name,
            category,
            quantity,
            price,
            description,
            image: Object.keys(fileData).length === 0 ? Moment?.image : fileData,
        },
        {
            new: true,
            runValidators: true,
        }
    );

    res.status(200).json(updatedMoment);
});

module.exports = {
    createMoments,
    getMoments,
    getMoment,
    deleteMoment,
    updateMoment,
};

