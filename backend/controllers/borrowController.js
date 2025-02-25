const Borrow = require('../models/Borrow');
const Book = require('../models/Book');

// Kitap ödünç alma
exports.borrowBook = async (req, res) => {
  try {
    const { bookId, dueDate } = req.body;
    const userId = req.user.id;

    // Kitabın müsait olup olmadığını kontrol et
    const book = await Book.findById(bookId);
    if (!book || book.quantity < 1) {
      return res.status(400).json({ message: 'Kitap stokta yok' });
    }

    // Kullanıcının aktif ödünç alma limiti kontrolü
    const activeLoans = await Borrow.countDocuments({
      user: userId,
      status: 'active'
    });

    if (activeLoans >= 3) {
      return res.status(400).json({ 
        message: 'Maksimum ödünç alma limitine ulaştınız' 
      });
    }

    // Ödünç kaydı oluştur
    const borrow = await Borrow.create({
      user: userId,
      book: bookId,
      dueDate: new Date(dueDate)
    });

    // Kitap stokunu güncelle
    book.quantity -= 1;
    await book.save();

    await borrow.populate('book', 'title author');
    res.status(201).json(borrow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Kitap iade etme
exports.returnBook = async (req, res) => {
  try {
    const { borrowId } = req.params;
    
    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      return res.status(404).json({ message: 'Kayıt bulunamadı' });
    }

    if (borrow.status === 'returned') {
      return res.status(400).json({ message: 'Kitap zaten iade edilmiş' });
    }

    // İade işlemini gerçekleştir
    borrow.status = 'returned';
    borrow.returnDate = new Date();
    await borrow.save();

    // Kitap stokunu güncelle
    const book = await Book.findById(borrow.book);
    book.quantity += 1;
    await book.save();

    res.json(borrow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Kullanıcının ödünç aldığı kitapları listele
exports.getUserBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find({ user: req.user.id })
      .populate('book', 'title author')
      .sort('-borrowDate');
    
    res.json(borrows);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Tüm ödünç işlemlerini listele (admin için)
exports.getAllBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find()
      .populate('book', 'title author')
      .populate('user', 'name email')
      .sort('-borrowDate');
    
    res.json(borrows);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 