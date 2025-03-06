const Book = require("../models/Book");
const Borrow = require("../models/Borrow");
const User = require("../models/User");
const sharp = require("sharp");

// Kitap işlemleri
exports.addBook = async (req, res) => {
  try {
    const { title, author, isbn, category, publishYear, quantity, location } =
      req.body;

    // Dosya yüklendi mi kontrolü
    const imageUrl = req.file ? `/uploads/books/${req.file.filename}` : null;

    const newBook = new Book({
      title,
      author,
      isbn,
      category,
      publishYear,
      quantity,
      location,
      imageUrl, // Artık dosya yolu olarak kaydediyoruz
    });

    await newBook.save();

    res.status(201).json({
      message: "Kitap başarıyla eklendi",
      book: newBook,
    });
  } catch (error) {
    res.status(500).json({
      message: "Kitap eklenirken bir hata oluştu",
      error: error.message,
    });
  }
};

// Ödünç verme işlemi
exports.lendBook = async (req, res) => {
  try {
    const { userId, bookId, dueDate } = req.body;

    // Kullanıcı kontrolü
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Kitap kontrolü
    const book = await Book.findById(bookId);
    if (!book || book.quantity < 1) {
      return res.status(400).json({ message: "Kitap stokta yok" });
    }

    // Kullanıcının aktif ödünç sayısı kontrolü
    const activeLoans = await Borrow.countDocuments({
      user: userId,
      status: "active",
    });

    if (activeLoans >= 3) {
      return res.status(400).json({
        message: "Kullanıcı maksimum ödünç alma limitine ulaşmış",
      });
    }

    // Ödünç kaydı oluştur
    const borrow = await Borrow.create({
      user: userId,
      book: bookId,
      dueDate: new Date(dueDate),
      lentBy: req.user.id, // Ödünç veren kütüphane görevlisi
    });

    // Kitap stokunu güncelle
    book.quantity -= 1;
    await book.save();

    await borrow.populate(["book", "user"]);
    res.status(201).json(borrow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Kitap iade alma
exports.receiveBook = async (req, res) => {
  try {
    const { borrowId } = req.params;
    const { condition, notes } = req.body;

    const borrow = await Borrow.findById(borrowId);
    if (!borrow) {
      return res.status(404).json({ message: "Ödünç kaydı bulunamadı" });
    }

    if (borrow.status === "returned") {
      return res.status(400).json({ message: "Kitap zaten iade edilmiş" });
    }

    // İade işlemi
    borrow.status = "returned";
    borrow.returnDate = new Date();
    borrow.receivedBy = req.user.id; // İade alan görevli
    borrow.returnCondition = condition;
    borrow.notes = notes;
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

// Ödünç süresini uzatma
exports.extendBorrowPeriod = async (req, res) => {
  try {
    const { borrowId } = req.params;
    const { newDueDate } = req.body;

    const borrow = await Borrow.findById(borrowId);
    if (!borrow || borrow.status !== "active") {
      return res.status(404).json({ message: "Aktif ödünç kaydı bulunamadı" });
    }

    borrow.dueDate = new Date(newDueDate);
    borrow.extendedBy = req.user.id;
    await borrow.save();

    res.json(borrow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Tüm ödünç işlemlerini listeleme
exports.getAllBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find()
      .populate("book", "title author")
      .populate("user", "name email")
      .sort("-borrowDate");

    res.json(borrows);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
