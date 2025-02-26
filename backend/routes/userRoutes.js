const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { getAllUsers, updateUser, deleteUser } = require('../controllers/userController');

// Kullanıcı profili işlemleri için temel rotalar
router.get('/profile', auth, (req, res) => {
  res.json({ message: 'Profil bilgileri' });
});

router.put('/profile', auth, (req, res) => {
  res.json({ message: 'Profil güncellendi' });
});

router.get('/', auth, admin, getAllUsers);
router.put('/:id', auth, admin, updateUser);
router.delete('/:id', auth, admin, deleteUser);

module.exports = router; 