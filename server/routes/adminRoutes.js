const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  getAllPosts,
  deleteUser,
  toggleBanUser,
  changeUserRole,
  deletePost,
  toggleHidePost,
  togglePinPost,
  toggleFeaturePost,
  getAnalytics,
} = require("../controllers/adminController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

router.use(
  protect,
  authorizeRoles("admin")
);

router.get(
  "/analytics",
  getAnalytics
);

router.get(
  "/users",
  getAllUsers
);

router.get(
  "/posts",
  getAllPosts
);

router.delete(
  "/user/:id",
  deleteUser
);

router.put(
  "/ban/:id",
  toggleBanUser
);

router.put(
  "/role/:id",
  changeUserRole
);

router.delete(
  "/post/:id",
  deletePost
);

router.put(
  "/hide/:id",
  toggleHidePost
);

router.put(
  "/pin/:id",
  togglePinPost
);

router.put(
  "/feature/:id",
  toggleFeaturePost
);

module.exports = router;