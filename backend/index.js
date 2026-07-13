require("dotenv").config();

const express = require("express");
const connectdb = require("./Config/db.js");
const authRoutes = require("./Routes/AuthRoutes");
const userRoutes = require("./Routes/User.Routes");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000", 
    "https://virtual-assistant-major-project.vercel.app",
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.get("/", (req, res) => res.send("Backend is running"));

const port = process.env.PORT || 5005;
app.listen(port, () => {
  connectdb();
  console.log(`Server started on http://localhost:${port}`);
});
