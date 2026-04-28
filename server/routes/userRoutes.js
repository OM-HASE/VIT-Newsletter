const express = require("express");
const router = express.Router();

const { updateProfile, changePassword } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.put("/update", protect, upload.single("image"), updateProfile);

router.put("/password", protect, changePassword);

module.exports = router;