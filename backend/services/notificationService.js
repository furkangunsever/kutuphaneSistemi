const Notification = require("../models/Notification");
const Borrow = require("../models/Borrow");
const User = require("../models/User");
const admin = require("../config/firebaseConfig");

// Firebase ile push bildirimi gönderme
const sendPushNotification = async (tokens, title, body, data = {}) => {
  if (!tokens || tokens.length === 0) return;

  try {
    const message = {
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      tokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log("Bildirim gönderildi:", response.successCount, "başarılı,", response.failureCount, "başarısız");
    return response;
  } catch (error) {
    console.error("Push bildirim gönderme hatası:", error);
  }
};

// Veritabanında bildirim oluşturma
const createNotification = async (userId, title, message, type, relatedItem = null) => {
  try {
    const notification = await Notification.create({
      user: userId,
      title,
      message,
      type,
      relatedItem,
      read: false,
    });
    
    return notification;
  } catch (error) {
    console.error("Bildirim oluşturma hatası:", error);
  }
};

// İade süresi yaklaşan kitaplar için kontrol
const checkReturnReminders = async () => {
  try {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // İade süresi yarın olan ödünç kayıtlarını bul
    const borrows = await Borrow.find({
      status: "active",
      dueDate: {
        $gte: today,
        $lte: tomorrow,
      },
      notificationSent: false, // Daha önce bildirim gönderilmediğinden emin ol
    }).populate("user book");

    console.log(`${borrows.length} adet yaklaşan iade süresi bulundu`);

    for (const borrow of borrows) {
      const user = borrow.user;
      const book = borrow.book;

      if (!user || !book) continue;

      // Push bildirimi için kullanıcının FCM tokenlarını al
      const tokens = user.fcmTokens || [];
      
      if (tokens.length > 0) {
        // Push bildirimi gönder
        await sendPushNotification(
          tokens,
          "Kitap İade Hatırlatması",
          `"${book.title}" kitabınızın iade süresi yarın doluyor!`,
          {
            type: "return_reminder",
            borrowId: borrow._id.toString(),
            bookId: book._id.toString(),
          }
        );
      }

      // Veritabanında bildirim oluştur
      await createNotification(
        user._id,
        "Kitap İade Hatırlatması",
        `"${book.title}" kitabınızın iade süresi yarın doluyor!`,
        "return_reminder",
        {
          itemType: "borrow",
          itemId: borrow._id,
        }
      );

      // Bildirim gönderildiğini işaretle
      borrow.notificationSent = true;
      await borrow.save();
    }
  } catch (error) {
    console.error("İade hatırlatma kontrolü hatası:", error);
  }
};

// Gecikmiş kitaplar için kontrol
const checkOverdueBooks = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 999);

    // Dün iade süresi dolan ve hala iade edilmemiş ödünç kayıtlarını bul
    const borrows = await Borrow.find({
      status: "active",
      dueDate: { $lte: yesterday },
      status: { $ne: "returned" },
      // Gecikme bildirimi gönderilmediğinden emin ol (gerekirse bu alan modele eklenebilir)
      overdueSent: { $ne: true },
    }).populate("user book");

    console.log(`${borrows.length} adet gecikmiş iade bulundu`);

    for (const borrow of borrows) {
      const user = borrow.user;
      const book = borrow.book;

      if (!user || !book) continue;

      // Push bildirimi için kullanıcının FCM tokenlarını al
      const tokens = user.fcmTokens || [];
      
      if (tokens.length > 0) {
        // Push bildirimi gönder
        await sendPushNotification(
          tokens,
          "Gecikmiş Kitap İadesi",
          `"${book.title}" kitabınızın iade süresi geçti! Lütfen en kısa sürede iade ediniz.`,
          {
            type: "overdue",
            borrowId: borrow._id.toString(),
            bookId: book._id.toString(),
          }
        );
      }

      // Veritabanında bildirim oluştur
      await createNotification(
        user._id,
        "Gecikmiş Kitap İadesi",
        `"${book.title}" kitabınızın iade süresi geçti! Lütfen en kısa sürede iade ediniz.`,
        "overdue",
        {
          itemType: "borrow",
          itemId: borrow._id,
        }
      );

      // Bildirim gönderildiğini işaretle
      borrow.overdueSent = true;
      await borrow.save();
    }
  } catch (error) {
    console.error("Gecikmiş kitap kontrolü hatası:", error);
  }
};

module.exports = {
  sendPushNotification,
  createNotification,
  checkReturnReminders,
  checkOverdueBooks,
};
