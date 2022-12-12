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
        // Save image to cloudinary
        let uploadedFile;
        try {
            uploadedFile = await cloudinary.uploader.upload(req.file.path, {
                folder: "Moments App",
                resource_type: "image",
            });
        } catch (error) {
            res.status(500);
            throw new Error("Image not uploaded");
        }

        fileData = {
            fileName: req.file.originalname,
            filePath: uploadedFile.secure_url,
            fileType: req.file.mimetype,
            fileSize: fileSizeFormatter(req.file.size, 2),
        };
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
    const Moments = await Moment.find({ user: req.user.id }).sort("-createdAt"); //returns last  updated
    res.status(200).json(Moments);
});

// Get single Moment
const getMoment = asyncHandler(async (req, res) => {
    const moment = await Moment.findById(req.params.id);
    // if Moment doesnt exist
    if (!moment) {
        res.status(404);
        throw new Error("Moment not found");
    }
    // Match Moment to its user
    if (moment.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error("User not authorized");
    }
    res.status(200).json(moment);
});

// Delete Moment
const deleteMoment = asyncHandler(async (req, res) => {
    const moment = await Moment.findById(req.params.id);
    // if Moment doesnt exist
    if (!moment) {
        res.status(404);
        throw new Error("Moment not found");
    }
    // Match Moment to its user
    if (moment.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error("User not authorized");
    }
    await moment.remove();
    res.status(200).json({ message: "Moment deleted." });
});

// Update Moment
const updateMoment = asyncHandler(async (req, res) => {
    const { title, tags } = req.body;
    const { id } = req.params;

    const moment = await Moment.findById(id);

    // if Moment doesnt exist
    if (!moment) {
        res.status(404);
        throw new Error("Moment not found");
    }
    // Match Moment to its user
    if (moment.user.toString() !== req.user.id) {
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
                folder: "Moments App",
                resource_type: "image",
            });
        } catch (error) {
            res.status(500);
            throw new Error("Image cannot be uploaded");
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
            title,
            tags,
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

