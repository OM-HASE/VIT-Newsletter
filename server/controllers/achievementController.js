const Achievement = require("../models/Achievement");
const User = require("../models/User");


// 🔥 CREATE (UPDATED FOR TEACHER)
exports.createAchievement = async (req, res) => {
  try {
    const { title, content, date } = req.body;

    const userId = req.user.id;
    const user = await User.findById(userId);

    const imageUrls = req.files?.map(file => file.path) || [];

    let achievement;
    if (user.role === "teacher" || user.role === "admin") {
      achievement = new Achievement({
        title,
        content,
        date,
        images: imageUrls,
        createdBy: userId,
        teacher: userId,
        status: "approved",
        isTeacherPost: true
      });

    } else {
      // 🧑‍🎓 STUDENT FLOW (UNCHANGED)
      if (!user.assignedTeacher) {
        return res.status(400).json({ message: "No teacher assigned" });
      }

      achievement = new Achievement({
        title,
        content,
        date,
        images: imageUrls,
        createdBy: userId,
        teacher: user.assignedTeacher,
        status: "pending"
      });
    }

    await achievement.save();

    res.status(201).json({
      message: "Achievement submitted successfully",
      achievement
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTeacherAchievements = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const achievements = await Achievement.find({
      $or: [
        { teacher: teacherId },          // student posts
        { createdBy: teacherId }         // teacher posts
      ]
    })
      .populate("createdBy", "name email image")
      .sort({ createdAt: -1 });

    res.json(achievements);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.approveAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ message: "Not found" });
    }

    achievement.status = "approved";
    await achievement.save();

    res.json({ message: "Approved successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.rejectAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ message: "Not found" });
    }

    achievement.status = "rejected";
    await achievement.save();

    res.json({ message: "Rejected successfully" });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ message: "Not found" });
    }

    // 🔒 Only owner or admin
    if (
      achievement.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not allowed" });
    }

    await achievement.deleteOne();

    res.json({ message: "Deleted successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.hideAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ message: "Not found" });
    }

    // 🔒 PERMISSION CHECK
    const isOwner = achievement.createdBy.toString() === req.user.id;
    const isAssignedTeacher = achievement.teacher.toString() === req.user.id;

    if (!isOwner && !isAssignedTeacher && req.user.role !== "admin") {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    // 🔥 TOGGLE LOGIC (HIDE / UNHIDE)
    achievement.isHidden = !achievement.isHidden;

    await achievement.save();

    res.json({
      message: achievement.isHidden
        ? "Post hidden"
        : "Post visible again",
      isHidden: achievement.isHidden,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({
      createdBy: req.user.id
    })
      .populate("createdBy", "name image email")
      .sort({ createdAt: -1 });

    res.json(achievements);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getApprovedAchievements = async (req, res) => {
  try {
    const { class: studentClass, teacher, date } = req.query;

    let query = {
      status: "approved",
      isHidden: false // 🔥 IMPORTANT
    };

    if (teacher) {
      query.teacher = teacher;
    }

    if (date) {
      query.date = {
        $gte: new Date(date),
        $lte: new Date(date)
      };
    }

    let achievements = await Achievement.find(query)
      .populate("createdBy", "name class image")
      .populate("teacher", "name image")
      .populate("comments.user", "name image")
      .sort({ createdAt: -1 });

    if (studentClass) {
      achievements = achievements.filter(
        (a) => a.createdBy && a.createdBy.class === studentClass
      );
    }

    res.json(achievements);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.likeAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement.likes) achievement.likes = [];

    const alreadyLiked = achievement.likes.some(
      (id) => id.toString() === req.user.id
    );

    if (alreadyLiked) {
      achievement.likes = achievement.likes.filter(
        (id) => id.toString() !== req.user.id
      );
    } else {
      achievement.likes.push(req.user.id);
    }

    await achievement.save();
    res.json(achievement);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    achievement.comments.push({
      user: req.user.id,
      text: req.body.text,
    });

    await achievement.save();

    res.json(achievement);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getSingleAchievement = async (req, res) => {
  try {
    const post = await Achievement.findById(req.params.id)
      .populate("createdBy", "name email image")
      .populate("teacher", "name image");

    res.json(post);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};