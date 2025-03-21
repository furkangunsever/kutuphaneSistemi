const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyToken,
  updateFCMToken,
  removeFCMToken,
} = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/register", register);
router.post("/login", login);
router.get("/verify", auth, verifyToken);
router.post("/fcm-token", auth, updateFCMToken);
router.delete("/fcm-token", auth, removeFCMToken);

module.exports = router;
