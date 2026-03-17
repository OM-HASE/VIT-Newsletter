const Achievement = require("../models/Achievement");
const User = require("../models/User");

exports.createAchievement = async (req, res) => {
  try {
    const { title, content, date, image } = req.body;

    const studentId = req.user.id;

    // find student
    const student = await User.findById(studentId);

    if (!student.assignedTeacher) {
      return res.status(400).json({ message: "No teacher assigned" });
    }

    const achievement = new Achievement({
      title,
      content,
      date,
      image,
      createdBy: studentId,
      teacher: student.assignedTeacher,
      status: "pending"
    });

    await achievement.save();

    res.status(201).json({
      message: "Achievement submitted for approval",
      achievement
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
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