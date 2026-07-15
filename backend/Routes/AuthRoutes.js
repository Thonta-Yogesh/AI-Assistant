const express = require("express");
const { signUp, Login, logout, debugEnv } = require("../Controllers/AuthController");

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", Login);
router.get("/logout", logout);
router.get("/debug-env", debugEnv);

module.exports = router;
