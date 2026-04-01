const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password, type, studentClass, classAssigned } = req.body;

    if (!email.endsWith("@vit.edu")) {
      return res.status(400).json({ message: "Use VIT email only" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let role = "student";

    // 👩‍🏫 TEACHER / ADMIN LOGIC
    if (type === "teacher") {
      role = "teacher";

      const adminEmails = process.env.ADMIN_EMAILS.split(",");
      if (adminEmails.includes(email)) {
        role = "admin";
      }
    }

    let assignedTeacher = null;

    // 🧑‍🎓 STUDENT → AUTO ASSIGN TEACHER
    if (type === "student") {
      if (!studentClass) {
        return res.status(400).json({ message: "Class is required" });
      }

      // find teacher for that class
      const teacher = await User.findOne({
        role: { $in: ["teacher", "admin"] },
        classAssigned: studentClass
      });

      if (!teacher) {
        return res.status(400).json({ message: "No teacher found for this class" });
      }

      assignedTeacher = teacher._id;
    }

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      class: type === "student" ? studentClass : "",
      classAssigned: type === "teacher" ? classAssigned : "",
      assignedTeacher
    });

    await user.save();

    res.status(201).json({
      message: `${role} registered successfully`
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};