const mongoose = require('mongoose');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const createSuperAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Önce mevcut süper admin kontrolü
    const existingAdmin = await User.findOne({ email: 'admin@admin.com' });
    
    if (existingAdmin) {
      console.log('Süper admin zaten mevcut!');
      process.exit(0);
    }

    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('admin123', salt);

    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@admin.com',
      password: hashedPassword,
      role: 'superadmin'
    });

    console.log('Süper admin başarıyla oluşturuldu:', {
      name: superAdmin.name,
      email: superAdmin.email,
      role: superAdmin.role
    });

  } catch (error) {
    console.error('Hata:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createSuperAdmin(); 