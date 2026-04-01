const express = require("express");
const router = express.Router();

const {
  createAchievement,
  getTeacherAchievements,
  approveAchievement,
  rejectAchievement,
  getMyAchievements,
  getApprovedAchievements
} = require("../controllers/achievementController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");


// 🧑‍🎓 Student routes
router.post("/", protect, authorizeRoles("student"), createAchievement);
router.get("/my", protect, authorizeRoles("student"), getMyAchievements);



// 👩‍🏫 Teacher routes
router.get("/teacher", protect, authorizeRoles("teacher", "admin"), getTeacherAchievements);
router.put("/approve/:id", protect, authorizeRoles("teacher", "admin"), approveAchievement);
router.put("/reject/:id", protect, authorizeRoles("teacher", "admin"), rejectAchievement);

// Public route (no auth needed)
router.get("/public", getApprovedAchievements);

module.exports = router;