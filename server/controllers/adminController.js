const User = require("../models/User");
const Achievement = require("../models/Achievement");

/* GET ALL USERS */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* GET ALL POSTS */
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Achievement.find()
      .populate(
        "createdBy",
        "name image role class"
      )
      .sort({ createdAt: -1 });

    res.json(posts);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* DELETE USER */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    await User.findByIdAndDelete(userId);

    await Achievement.deleteMany({
      createdBy: userId,
    });

    res.json({
      message: "User deleted",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* BAN USER */
exports.toggleBanUser = async (req, res) => {
  try {
    const user = await User.findById(
      req.params.id
    );

    user.isBanned = !user.isBanned;

    await user.save();

    res.json(user);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* CHANGE ROLE */
exports.changeUserRole = async (
  req,
  res
) => {
  try {
    const { role } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    );

    res.json(user);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* DELETE POST */
exports.deletePost = async (req, res) => {
  try {
    await Achievement.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Post deleted",
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* HIDE POST */
exports.toggleHidePost = async (
  req,
  res
) => {
  try {
    const post =
      await Achievement.findById(
        req.params.id
      );

    post.isHidden = !post.isHidden;

    await post.save();

    res.json(post);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* PIN POST */
exports.togglePinPost = async (
  req,
  res
) => {
  try {
    const post =
      await Achievement.findById(
        req.params.id
      );

    post.isPinned = !post.isPinned;

    await post.save();

    res.json(post);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* FEATURE POST */
exports.toggleFeaturePost = async (
  req,
  res
) => {
  try {
    const post =
      await Achievement.findById(
        req.params.id
      );

    post.isFeatured =
      !post.isFeatured;

    await post.save();

    res.json(post);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

/* DASHBOARD ANALYTICS */
exports.getAnalytics = async (
  req,
  res
) => {
  try {
    const totalUsers =
      await User.countDocuments();

    const totalStudents =
      await User.countDocuments({
        role: "student",
      });

    const totalTeachers =
      await User.countDocuments({
        role: "teacher",
      });

    const totalPosts =
      await Achievement.countDocuments();

    const approvedPosts =
      await Achievement.countDocuments({
        status: "approved",
      });

    res.json({
      totalUsers,
      totalStudents,
      totalTeachers,
      totalPosts,
      approvedPosts,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};