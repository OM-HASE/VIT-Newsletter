require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const achievementRoutes = require("./routes/achievementRoutes");
const app = express();
app.set("trust proxy", 1);
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

// middleware
app.use(express.json());
app.use(cors());
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/api/users", userRoutes);


app.use("/api/admin", adminRoutes);

// DB connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});