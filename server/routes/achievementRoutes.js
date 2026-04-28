const express = require("express");
const router = express.Router();

const {
  createAchievement,
  getTeacherAchievements,
  approveAchievement,
  rejectAchievement,
  getMyAchievements,
  getApprovedAchievements,
  likeAchievement,
  addComment,
  getSingleAchievement,
  deleteAchievement,
  hideAchievement
} = require("../controllers/achievementController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


// 🧑‍🎓 Student routes
router.post("/",protect,authorizeRoles("student"),upload.array("images", 5),createAchievement);
router.get("/my", protect, authorizeRoles("student"), getMyAchievements);



// 👩‍🏫 Teacher routes
router.get("/teacher", protect, authorizeRoles("teacher", "admin"), getTeacherAchievements);
router.put("/approve/:id", protect, authorizeRoles("teacher", "admin"), approveAchievement);
router.put("/reject/:id", protect, authorizeRoles("teacher", "admin"), rejectAchievement);
router.delete("/delete/:id", protect, deleteAchievement);
router.put("/hide/:id", protect, hideAchievement);

// Public route (no auth needed)
router.get("/public", getApprovedAchievements);
router.put("/like/:id", protect, likeAchievement);
router.post("/comment/:id", protect, addComment);
router.get("/:id", getSingleAchievement);

module.exports = router;