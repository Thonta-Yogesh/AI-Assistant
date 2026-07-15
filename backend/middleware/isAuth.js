const jwt = require("jsonwebtoken");

const isAuth = async (req, res, next) => {
  try {
    let token = req.cookies.token;
    if (!token && req.headers.authorization) {
      token = req.headers.authorization.split(" ")[1] || req.headers.authorization;
    }
    if (!token) {
      return res.status(401).json({ message: "Authentication token not found" });
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.log(error);
    return res.status(401).json({ message: "Authentication error" });
  }
};

module.exports = isAuth;