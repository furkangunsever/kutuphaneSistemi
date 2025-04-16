const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
} = require("../controllers/notificationController");

// Kullanıcının bildirimlerini getir
router.get("/", auth, getUserNotifications);

// Bildirimi okundu olarak işaretle
router.put("/:id/read", auth, markAsRead);

// Tüm bildirimleri okundu olarak işaretle
router.put("/read-all", auth, markAllAsRead);

module.exports = router; 