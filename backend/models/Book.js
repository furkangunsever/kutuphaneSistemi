const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Kitap adı zorunludur']
  },
  author: {
    type: String,
    required: [true, 'Yazar adı zorunludur']
  },
  ISBN: {
    type: String,
    required: [true, 'ISBN numarası zorunludur'],
    unique: true
  },
  quantity: {
    type: Number,
    required: [true, 'Stok miktarı zorunludur'],
    min: 0
  },
  category: {
    type: String,
    required: [true, 'Kategori zorunludur']
  },
  description: String,
  location: String,
  status: {
    type: String,
    enum: ['available', 'borrowed', 'maintenance'],
    default: 'available'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Book', bookSchema); 