const User = require("../Models/UserModel");
const bcrypt = require("bcryptjs");
const gentoken = require("../Config/token.js");

exports.signUp = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword });
    const token = await gentoken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });

    const userObj = user.toObject();
    userObj.token = token;
    return res.status(201).json(userObj);
  } catch (error) {
    return res.status(500).json({ message: `Sign-up error: ${error}` });
  }
};

exports.Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = await gentoken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "None",
      secure: true,
    });

    const userObj = user.toObject();
    userObj.token = token;
    return res.status(200).json(userObj);
  } catch (error) {
    return res.status(500).json({ message: `Login error: ${error}` });
  }
};

exports.logout = async (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, sameSite: "None", secure: true });
    return res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: `Logout error: ${error}` });
  }
};
