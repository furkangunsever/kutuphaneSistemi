const User = require("../models/User");

exports.getAllUsers = async (req, res) => {
  try {
    // superadmin dışındaki kullanıcıları getir
    const users = await User.find({ role: { $ne: "superadmin" } }).select(
      "-password"
    );
    res.json(users);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { name, role } = req.body;

    // Güncellenecek kullanıcının mevcut rolünü kontrol et
    const existingUser = await User.findById(req.params.id);
    if (existingUser.role === "superadmin") {
      return res
        .status(403)
        .json({ message: "Süper admin kullanıcısı güncellenemez" });
    }

    // role seçeneğini sadece user ve librarian ile sınırla
    if (role && !["user", "librarian"].includes(role)) {
      return res.status(400).json({ message: "Geçersiz rol" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    // Silinecek kullanıcının rolünü kontrol et
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    if (user.role === "superadmin") {
      return res
        .status(403)
        .json({ message: "Süper admin kullanıcısı silinemez" });
    }

    await user.remove();
    res.json({ message: "Kullanıcı başarıyla silindi" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
