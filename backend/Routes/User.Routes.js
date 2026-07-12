const express=require("express");
const { getCurrentUser, updateAssistant, askToAssistant, demoChat } = require("../Controllers/UserController");
const isAuth=require("../middleware/isAuth")
const upload =require("../middleware/multer")

const userrouter=express.Router()

// Unprotected demo route — used in bypass/test mode (no JWT required)
userrouter.post("/chat", demoChat)

// Protected routes
userrouter.get("/current",isAuth,getCurrentUser)
userrouter.post("/update",isAuth,upload.single("assistantImage"),updateAssistant)
userrouter.post("/asktoassistant",isAuth,askToAssistant)
module.exports=userrouter
