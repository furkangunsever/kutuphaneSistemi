const mongoose = require('mongoose');
const User = require('../models/User');
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

    const superAdmin = await User.create({
      name: 'Super Admin',
      email: 'admin@admin.com',
      password: 'admin123',
      role: 'admin'
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