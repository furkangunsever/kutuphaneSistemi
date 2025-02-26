const admin = (req, res, next) => {
  console.log('User role:', req.user.role); // Debug için
  
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({ 
      message: 'Bu işlem için süper admin yetkisi gerekiyor' 
    });
  }
  next();
};

module.exports = admin; 