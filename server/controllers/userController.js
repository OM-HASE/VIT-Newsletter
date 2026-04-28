const User = require("../models/User");

// 🔹 UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const { name } = req.body;

    let updateData = { name };

    // If image uploaded
    if (req.file) {
      updateData.image = req.file.path;
    }

    const user = await User.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    );

    res.json({
      message: "Profile updated",
      user,
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const bcrypt = require("bcryptjs");

exports.changePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    const { currentPassword, newPassword } = req.body;

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Wrong password" });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    await user.save();

    res.json({ message: "Password updated" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};