const User = require("../models/User");
const Otp = require("../models/Otp");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");

// ================= EMAIL SETUP =================
// ================= EMAIL SETUP =================
console.log("SMTP_LOGIN =", process.env.SMTP_LOGIN);
console.log("SMTP_PASSWORD EXISTS =", !!process.env.SMTP_PASSWORD);

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.SMTP_LOGIN,
    pass: process.env.SMTP_PASSWORD,
  },
  connectionTimeout: 10000,
  greetingTimeout: 10000,
  socketTimeout: 10000,
});

transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP ERROR:", error);
  } else {
    console.log("SMTP READY");
  }
});
// ================= SEND OTP =================
exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !email.endsWith("@vit.edu")) {
      return res.status(400).json({ message: "Use VIT email only" });
    }

    // generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    // delete old OTP
    await Otp.deleteMany({ email });

    // store OTP
    await Otp.create({
      email,
      otp,
      expiresAt,
      isVerified: false
    });

    // send email
    await transporter.sendMail({
      from: process.env.SMTP_LOGIN,
      to: email,
      subject: "VIT Newsletter OTP",
      text: `Your OTP is ${otp}. Valid for 5 minutes.`
    });

    res.json({ message: "OTP sent successfully" });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    res.status(500).json({ message: error.message, code: error.code, });
  }
};

// ================= VERIFY OTP =================
exports.verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const record = await Otp.findOne({ email });

    if (!record) {
      return res.status(400).json({ message: "OTP not found" });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    // mark verified
    record.isVerified = true;
    await record.save();

    res.json({ message: "OTP verified" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= REGISTER =================
exports.register = async (req, res) => {
  try {
    const { name, email, password, type, studentClass, classAssigned } = req.body;

    if (!email.endsWith("@vit.edu")) {
      return res.status(400).json({ message: "Use VIT email only" });
    }

    // 🔐 CHECK OTP VERIFIED
    const otpRecord = await Otp.findOne({ email });

    if (!otpRecord || !otpRecord.isVerified) {
      return res.status(400).json({ message: "Email not verified with OTP" });
    }

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let role = "student";

    if (type === "teacher") {
      role = "teacher";

      const adminEmails = process.env.ADMIN_EMAILS.split(",");
      if (adminEmails.includes(email)) {
        role = "admin";
      }
    }

    let assignedTeacher = null;

    if (type === "student") {
      if (!studentClass) {
        return res.status(400).json({ message: "Class is required" });
      }

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

    // 🧹 cleanup OTP after success
    await Otp.deleteMany({ email });

    res.status(201).json({
      message: `${role} registered successfully`
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (user.isBanned) {return res.status(403).json({message: "Account suspended by admin",});}
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

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
    res.status(500).json({ message: error.message });
  }
};