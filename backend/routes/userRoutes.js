const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Kullanıcı profili işlemleri için temel rotalar
router.get('/profile', auth, (req, res) => {
  res.json({ message: 'Profil bilgileri' });
});

router.put('/profile', auth, (req, res) => {
  res.json({ message: 'Profil güncellendi' });
});

module.exports = router; 