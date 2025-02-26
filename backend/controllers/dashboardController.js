const Book = require('../models/Book');
const User = require('../models/User');
const Borrow = require('../models/Borrow');

exports.getStats = async (req, res) => {
  try {
    // Tüm istatistikleri paralel olarak al
    const [totalBooks, totalUsers, totalBorrows, activeBorrows] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments(),
      Borrow.countDocuments(),
      Borrow.countDocuments({ status: 'active' })
    ]);

    // Kitap stok toplamını hesapla
    const books = await Book.find();
    const totalStock = books.reduce((sum, book) => sum + book.quantity, 0);

    res.json({
      totalBooks,
      totalStock,
      totalUsers,
      totalBorrows,
      activeBorrows
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 