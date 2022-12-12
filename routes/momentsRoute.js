const express = require("express");
const router = express.Router();
const protect = require("../middleWare/authMiddleware");
const {
    createMoments,
    getMoments,
    getMoment,
    deleteMoment,
    updateMoment, } = require("../controllers/momentsController");
const { upload } = require("../utils/fileUpload");

router.post("/", protect, upload.single("image"), createMoments);
router.patch("/:id", protect, upload.single("image"), updateMoment);
router.get("/", protect, getMoments);
router.get("/:id", protect, getMoment);
router.delete("/:id", protect, deleteMoment);

module.exports = router;
