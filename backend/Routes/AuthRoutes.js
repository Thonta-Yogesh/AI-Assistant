const express = require("express");
const { signUp, Login, logout } = require("../Controllers/AuthController");

const router = express.Router();

router.post("/signup", signUp);
router.post("/signin", Login);
router.get("/logout", logout);

module.exports = router;
