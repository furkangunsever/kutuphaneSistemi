const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      message: 'Bu işlem için admin yetkisi gerekiyor' 
    });
  }
  next();
};

module.exports = admin; 