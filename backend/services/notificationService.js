const admin = require("../config/firebaseConfig");
const User = require("../models/User");
const Borrow = require("../models/Borrow");

const sendNotification = async (userId, title, body) => {
  try {
    const user = await User.findById(userId);
    if (!user || !user.fcmTokens || user.fcmTokens.length === 0) {
      console.log("Kullanıcı için FCM token bulunamadı:", userId);
      return;
    }

    const message = {
      notification: {
        title,
        body,
      },
      tokens: user.fcmTokens,
    };

    const response = await admin.messaging().sendMulticast(message);
    console.log("Bildirimler gönderildi:", response);

    // Geçersiz tokenları temizle
    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(user.fcmTokens[idx]);
        }
      });

      if (failedTokens.length > 0) {
        await User.findByIdAndUpdate(userId, {
          $pull: { fcmTokens: { $in: failedTokens } },
        });
      }
    }
  } catch (error) {
    console.error("Bildirim gönderme hatası:", error);
  }
};

const checkDueDates = async () => {
  try {
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    // Süresi 3 gün içinde dolacak aktif ödünç kayıtlarını bul
    const dueBorrows = await Borrow.find({
      status: "active",
      dueDate: {
        $gte: new Date(),
        $lte: threeDaysFromNow,
      },
      notificationSent: { $ne: true },
    }).populate("book user");

    for (const borrow of dueBorrows) {
      await sendNotification(
        borrow.user._id,
        "Kitap İade Hatırlatması",
        `"${
          borrow.book.title
        }" adlı kitabın iade süresi ${borrow.dueDate.toLocaleDateString()} tarihinde dolacak.`
      );

      // Bildirim gönderildi olarak işaretle
      await Borrow.findByIdAndUpdate(borrow._id, { notificationSent: true });
    }
  } catch (error) {
    console.error("İade kontrolü hatası:", error);
  }
};

module.exports = {
  sendNotification,
  checkDueDates,
};
