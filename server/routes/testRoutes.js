const express = require("express");
const router = express.Router();

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Only logged in users
router.get("/user", protect, (req, res) => {
  res.json({ message: "User access granted", user: req.user });
});

// Only teachers
router.get("/teacher", protect, authorizeRoles("teacher", "admin"), (req, res) => {
  res.json({ message: "Teacher/Admin access granted" });
});

// Only students
router.get("/student", protect, authorizeRoles("student"), (req, res) => {
  res.json({ message: "Student access granted" });
});

module.exports = router;