const Borrow = require("../models/Borrow");
const Book = require("../models/Book");

// Kitap ödünç alma
exports.borrowBook = async (req, res) => {
  try {
    const { bookId, dueDate } = req.body;
    const userId = req.user.id;

    // Kitabın müsait olup olmadığını kontrol et
    const book = await Book.findById(bookId);
    if (!book || book.quantity < 1) {
      return res.status(400).json({ message: "Kitap stokta yok" });
    }

    // Kullanıcının aktif ödünç alma limiti kontrolü
    const activeLoans = await Borrow.countDocuments({
      user: userId,
      status: "active",
    });

    if (activeLoans >= 3) {
      return res.status(400).json({
        message: "Maksimum ödünç alma limitine ulaştınız",
      });
    }

    // Ödünç kaydı oluştur
    const borrow = await Borrow.create({
      user: userId,
      book: bookId,
      dueDate: new Date(dueDate),
    });

    // Kitap stokunu güncelle
    book.quantity -= 1;
    await book.save();

    await borrow.populate("book", "title author");
    res.status(201).json(borrow);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Kitap iade etme
exports.returnBook = async (req, res) => {
  try {
    const { borrowId } = req.params;
    const { condition, notes } = req.body;
    const processedBy = req.user.id; // İşlemi yapan görevli

    const borrow = await Borrow.findById(borrowId)
      .populate("book", "title author imageUrl")
      .populate("user", "name email");

    if (!borrow) {
      return res.status(404).json({ message: "Ödünç kaydı bulunamadı" });
    }

    if (borrow.status === "returned") {
      return res.status(400).json({ message: "Kitap zaten iade edilmiş" });
    }

    // Kitabın durumunu kontrol et
    if (!["excellent", "good", "fair", "poor", "damaged"].includes(condition)) {
      return res.status(400).json({ message: "Geçersiz kitap durumu" });
    }

    // İade işlemini gerçekleştir
    borrow.status = "returned";
    borrow.returnDate = new Date();
    borrow.returnCondition = condition;
    borrow.notes = notes || "";
    borrow.processedBy = processedBy;
    await borrow.save();

    // Kitap stokunu güncelle
    const book = await Book.findById(borrow.book._id);
    book.quantity += 1;

    // Eğer kitap hasarlı ise bunu kaydet
    if (condition === "damaged") {
      book.notes = book.notes || [];
      book.notes.push({
        type: "damage",
        date: new Date(),
        description: notes,
        reportedBy: processedBy,
      });
    }

    await book.save();

    res.json({
      message: "Kitap başarıyla iade edildi",
      borrow: {
        id: borrow._id,
        book: {
          id: borrow.book._id,
          title: borrow.book.title,
          author: borrow.book.author,
          imageUrl: borrow.book.imageUrl,
        },
        user: {
          id: borrow.user._id,
          name: borrow.user.name,
          email: borrow.user.email,
        },
        borrowDate: borrow.borrowDate,
        dueDate: borrow.dueDate,
        returnDate: borrow.returnDate,
        condition: borrow.returnCondition,
        notes: borrow.notes,
        processedBy: borrow.processedBy,
      },
    });
  } catch (error) {
    console.error("İade işlemi hatası:", error);
    res.status(500).json({
      message: "İade işlemi sırasında bir hata oluştu",
      error: error.message,
    });
  }
};

// Kullanıcının ödünç aldığı kitapları listele
exports.getUserBorrows = async (req, res) => {
  try {
    const borrows = await Borrow.find({ user: req.user.id })
      .populate("book", "title author imageUrl isbn")
      .sort("-borrowDate")
      .lean();

    const formattedBorrows = borrows.map((borrow) => ({
      id: borrow._id,
      bookTitle: borrow.book.title,
      bookAuthor: borrow.book.author,
      bookImage: borrow.book.imageUrl,
      isbn: borrow.book.isbn,
      borrowDate: borrow.borrowDate,
      dueDate: borrow.dueDate,
      returnDate: borrow.returnDate,
      status: borrow.status,
      notes: borrow.notes,
    }));

    res.json({
      count: formattedBorrows.length,
      borrows: formattedBorrows,
    });
  } catch (error) {
    console.error("Ödünç kayıtları getirme hatası:", error);
    res.status(500).json({
      message: "Ödünç kayıtları alınırken bir hata oluştu",
      error: error.message,
    });
  }
};

// Tüm ödünç işlemlerini listele (admin için)
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

// Aktif ödünç işlemlerini getir
exports.getActiveBorrows = async (req, res) => {
  try {
    const activeBorrows = await Borrow.find({ status: "active" })
      .populate("book", "title author isbn imageUrl")
      .populate("user", "name email")
      .sort("-borrowDate")
      .lean();

    const formattedBorrows = activeBorrows.map((borrow) => ({
      id: borrow._id,
      bookTitle: borrow.book.title,
      bookAuthor: borrow.book.author,
      bookIsbn: borrow.book.isbn,
      bookImage: borrow.book.imageUrl,
      userName: borrow.user.name,
      userEmail: borrow.user.email,
      borrowDate: borrow.borrowDate,
      dueDate: borrow.dueDate,
      remainingDays: Math.ceil(
        (new Date(borrow.dueDate) - new Date()) / (1000 * 60 * 60 * 24)
      ),
    }));

    res.json(formattedBorrows);
  } catch (error) {
    console.error("Aktif ödünç kayıtları getirme hatası:", error);
    res.status(500).json({
      message: "Aktif ödünç kayıtları alınırken bir hata oluştu",
      error: error.message,
    });
  }
};

// Gecikmiş kitapları listeleme
exports.getOverdueBooks = async (req, res) => {
  try {
    const overdueBorrows = await Borrow.find({
      status: "active",
      dueDate: { $lt: new Date() },
    })
      .populate("book", "title author isbn imageUrl")
      .populate("user", "name email")
      .sort("dueDate");

    const formattedOverdue = overdueBorrows.map((borrow) => ({
      id: borrow._id,
      bookTitle: borrow.book.title,
      bookAuthor: borrow.book.author,
      bookIsbn: borrow.book.isbn,
      bookImage: borrow.book.imageUrl,
      userName: borrow.user.name,
      userEmail: borrow.user.email,
      borrowDate: borrow.borrowDate,
      dueDate: borrow.dueDate,
      daysOverdue: Math.ceil(
        (new Date() - new Date(borrow.dueDate)) / (1000 * 60 * 60 * 24)
      ),
    }));

    res.json(formattedOverdue);
  } catch (error) {
    res.status(500).json({
      message: "Gecikmiş kitaplar listelenirken bir hata oluştu",
      error: error.message,
    });
  }
};

// Belirli bir kitabın ödünç geçmişini getir
exports.getBookBorrowHistory = async (req, res) => {
  try {
    const { bookId } = req.params;

    const borrowHistory = await Borrow.find({ book: bookId })
      .populate("user", "name email")
      .sort("-borrowDate")
      .lean();

    const formattedHistory = borrowHistory.map((borrow) => ({
      id: borrow._id,
      userName: borrow.user.name,
      userEmail: borrow.user.email,
      borrowDate: borrow.borrowDate,
      dueDate: borrow.dueDate,
      returnDate: borrow.returnDate,
      status: borrow.status,
      condition: borrow.returnCondition,
      notes: borrow.notes,
    }));

    res.json(formattedHistory);
  } catch (error) {
    res.status(500).json({
      message: "Kitap ödünç geçmişi alınırken bir hata oluştu",
      error: error.message,
    });
  }
};
