const geminiResponse = require("../gemini");
const moment = require("moment");
const User = require("../Models/user.models");
const { uploadOnCloudinary } = require("../Config/cloudinary");

exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching user" });
  }
};

exports.updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageurl } = req.body;
    let assistantImage;

    if (req.file) {
      try {
        assistantImage = await uploadOnCloudinary(req.file.path);
      } catch {
        return res.status(500).json({ message: "Image upload failed" });
      }
    } else {
      assistantImage = imageurl;
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName, assistantImage },
      { new: true }
    ).select("-password");

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "UpdateAssistant error" });
  }
};

const handleGeminiCommand = async (command, assistantName, userName, res) => {
  const result = await geminiResponse(command, assistantName, userName);
  if (!result) return res.status(500).json({ response: "Assistant failed to respond." });

  const jsonMatch = result.match(/{[\s\S]*}/);
  if (!jsonMatch) return res.status(400).json({ response: "Sorry, I couldn't understand that." });

  let gemResult;
  try {
    gemResult = JSON.parse(jsonMatch[0]);
  } catch {
    return res.status(400).json({ response: "Invalid response format." });
  }

  let { type, userInput } = gemResult;
  type = type.replace(/_/g, "-");

  switch (type) {
    case "get-date":
      return res.json({ type, userInput, response: `Today's date is ${moment().format("MMMM Do, YYYY")}` });
    case "get-time":
      return res.json({ type, userInput, response: `Current time is ${moment().format("hh:mm A")}` });
    case "get-day":
      return res.json({ type, userInput, response: `Today is ${moment().format("dddd")}` });
    case "get-month":
      return res.json({ type, userInput, response: `Current month is ${moment().format("MMMM")}` });
    case "general":
    case "google-search":
    case "youtube-search":
    case "youtube-play":
    case "calculator-open":
    case "instagram-open":
    case "facebook-open":
    case "weather-show":
      return res.json({ type, userInput, response: gemResult.response });
    default:
      return res.status(400).json({ response: "Sorry, I couldn't understand that." });
  }
};

exports.askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const user = await User.findById(req.userId);
    user.history.push(command);
    await user.save();
    await handleGeminiCommand(command, user.assistantName, user.name, res);
  } catch (error) {
    console.error("Error in askToAssistant:", error);
    return res.status(500).json({ response: "Internal server error" });
  }
};

// Unprotected demo endpoint (no auth required — useful for quick testing)
exports.demoChat = async (req, res) => {
  try {
    const { command, assistantName, userName } = req.body;
    if (!command) return res.status(400).json({ response: "No command provided." });
    await handleGeminiCommand(command, assistantName || "Assistant", userName || "User", res);
  } catch (error) {
    return res.status(500).json({ response: "Internal server error" });
  }
};
