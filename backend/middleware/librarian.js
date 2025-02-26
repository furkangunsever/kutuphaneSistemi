const librarianAuth = (req, res, next) => {
  if (req.user.role !== 'librarian' && req.user.role !== 'superadmin') {
    return res.status(403).json({ 
      message: 'Bu işlem için kütüphane yetkilisi veya admin yetkisi gerekiyor' 
    });
  }
  next();
};

module.exports = librarianAuth; 