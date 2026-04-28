const Achievement = require("../models/Achievement");
const User = require("../models/User");

exports.createAchievement = async (req, res) => {
  try {
    const { title, content, date } = req.body;

    const studentId = req.user.id;

    const student = await User.findById(studentId);

    if (!student.assignedTeacher) {
      return res.status(400).json({ message: "No teacher assigned" });
    }

    const imageUrls = req.files?.map(file => file.path) || [];

    const achievement = new Achievement({
      title,
      content,
      date,
      images: imageUrls,
      createdBy: studentId,
      teacher: student.assignedTeacher,
      status: "pending"
    });

    await achievement.save();

    res.status(201).json({
      message: "Achievement submitted successfully",
      achievement
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
  console.log("FILES:", req.files);
};


// 👩‍🏫 TEACHER: VIEW ASSIGNED ACHIEVEMENTS
exports.getTeacherAchievements = async (req, res) => {
  try {
    const teacherId = req.user.id;

    const achievements = await Achievement.find({ teacher: teacherId })
      .populate("createdBy", "name email");

    res.json(achievements);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 👩‍🏫 TEACHER: APPROVE
exports.approveAchievement = async (req, res) => {
  try {
    const { id } = req.params;

    const achievement = await Achievement.findById(id);

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


// 👩‍🏫 TEACHER: REJECT
exports.rejectAchievement = async (req, res) => {
  try {
    const { id } = req.params;

    const achievement = await Achievement.findById(id);

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


// 🧑‍🎓 STUDENT: VIEW OWN ACHIEVEMENTS
exports.getMyAchievements = async (req, res) => {
  try {
    const studentId = req.user.id;

    const achievements = await Achievement.find({ createdBy: studentId });

    res.json(achievements);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🌍 PUBLIC: GET APPROVED ACHIEVEMENTS WITH FILTERS
exports.getApprovedAchievements = async (req, res) => {
  try {
    const { class: studentClass, teacher, date } = req.query;
    let query = { status: "approved" };

    if (studentClass) {
      query = {
        ...query,
      };
    }

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
      .populate("createdBy", "name class") 
      .populate("teacher", "name")        
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

    if (!achievement) {
      return res.status(404).json({ message: "Not found" });
    }

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
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;

    const achievement = await Achievement.findById(req.params.id);

    achievement.comments.push({
      user: req.user.id,
      text,
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
      .populate("createdBy", "name email")
      .populate("teacher", "name");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};