const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization').replace('Bearer ', '');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Kullanıcıyı veritabanından al
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new Error();
    }

    // Token'dan gelen bilgileri request'e ekle
    req.user = {
      id: user._id,
      role: user.role // Kullanıcının güncel rolünü kullan
    };
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Lütfen giriş yapın' });
  }
};

module.exports = auth; 