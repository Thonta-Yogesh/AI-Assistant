const express = require("express");
const { getCurrentUser, updateAssistant, askToAssistant } = require("../Controllers/UserController");
const isAuth = require("../middleware/isAuth");
const upload = require("../middleware/multer");

const router = express.Router();

// Protected routes — require valid JWT token
router.get("/current", isAuth, getCurrentUser);
router.post("/update", isAuth, upload.single("assistantImage"), updateAssistant);
router.post("/asktoassistant", isAuth, askToAssistant);

module.exports = router;
