const Notification = require("../models/Notification");

// Kullanıcının bildirimlerini getir
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 }) // En yeni bildirimler önce
      .lean();
    
    res.json(notifications);
  } catch (error) {
    console.error("Bildirim getirme hatası:", error);
    res.status(500).json({
      message: "Bildirimler alınırken bir hata oluştu",
      error: error.message,
    });
  }
};

// Bildirimi okundu olarak işaretle
exports.markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user.id;

    // Bildirimi bul ve sadece kullanıcıya ait ise güncelle
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Bildirim bulunamadı" });
    }

    res.json({ message: "Bildirim okundu olarak işaretlendi", notification });
  } catch (error) {
    console.error("Bildirim güncelleme hatası:", error);
    res.status(500).json({
      message: "Bildirim güncellenirken bir hata oluştu",
      error: error.message,
    });
  }
};

// Tüm bildirimleri okundu olarak işaretle
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );

    res.json({
      message: "Tüm bildirimler okundu olarak işaretlendi",
      count: result.nModified
    });
  } catch (error) {
    console.error("Toplu bildirim güncelleme hatası:", error);
    res.status(500).json({
      message: "Bildirimler güncellenirken bir hata oluştu",
      error: error.message,
    });
  }
}; 