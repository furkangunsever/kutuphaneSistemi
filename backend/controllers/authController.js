const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Bu email zaten kayıtlı" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "user",
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log("Login attempt:", { email });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Geçersiz email veya şifre" });
    }

    console.log("User found:", { email: user.email, role: user.role });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Geçersiz email veya şifre" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(400).json({ message: error.message });
  }
};

exports.verifyToken = async (req, res) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      throw new Error();
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ message: "Token geçersiz" });
  }
};

exports.updateFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;

    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token gerekli" });
    }

    // Token'ı kullanıcının token listesine ekle (eğer yoksa)
    await User.findByIdAndUpdate(userId, {
      $addToSet: { fcmTokens: fcmToken },
    });

    res.json({ message: "FCM token başarıyla güncellendi" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.removeFCMToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.user.id;

    if (!fcmToken) {
      return res.status(400).json({ message: "FCM token gerekli" });
    }

    // Token'ı kullanıcının listesinden kaldır
    await User.findByIdAndUpdate(userId, {
      $pull: { fcmTokens: fcmToken },
    });

    res.json({ message: "FCM token başarıyla kaldırıldı" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
