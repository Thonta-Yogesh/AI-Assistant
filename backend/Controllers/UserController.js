const geminiResponse = require("../gemini");
const moment = require("moment");
const User = require("../Models/UserModel");
const { uploadOnCloudinary } = require("../Config/cloudinary");

// ── Get the currently authenticated user ──
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ message: "Server error while fetching user" });
  }
};

// ── Update assistant name and/or image ──
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
    return res.status(500).json({ message: "Failed to update assistant" });
  }
};

// ── Internal helper: process a command through Gemini and return the response ──
const handleGeminiCommand = async (command, assistantName, userName, lang, chatHistory, res) => {
  // Inject current date/time so Gemini can answer time-related queries in the requested language
  const timeContext = `[Context: Current date is ${moment().format("MMMM Do, YYYY")}, current time is ${moment().format("hh:mm A")}, today is ${moment().format("dddd")}]. `;
  const commandWithContext = timeContext + command;

  const result = await geminiResponse(commandWithContext, assistantName, userName, lang, chatHistory);
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
    case "get-time":
    case "get-day":
    case "get-month":
    case "general":
    case "google-search":
    case "youtube-search":
    case "youtube-play":
    case "calculator-open":
    case "instagram-open":
    case "facebook-open":
    case "weather-show":
      return res.json({
        type,
        userInput,
        lang,
        response: gemResult.response,
        responseRoman: gemResult.responseRoman || gemResult.response,
      });
    default:
      return res.status(400).json({ response: "Sorry, I couldn't understand that." });
  }
};

// ── Process a voice or text command from the authenticated user ──
exports.askToAssistant = async (req, res) => {
  try {
    const { command, lang, chatHistory } = req.body;
    const user = await User.findById(req.userId);
    user.history.push(command);
    await user.save();
    await handleGeminiCommand(
      command,
      user.assistantName,
      user.name,
      lang || "en-IN",
      chatHistory,
      res
    );
  } catch (error) {
    console.error("Error in askToAssistant:", error);
    return res.status(500).json({ response: "Internal server error" });
  }
};
