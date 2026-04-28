const express = require("express");
const router = express.Router();

const { updateProfile, changePassword, getProfile, deleteAccount } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/me", protect, getProfile);
router.put("/update", protect, upload.single("image"), updateProfile);
router.put("/password", protect, changePassword);
router.delete("/delete", protect, deleteAccount);

module.exports = router;