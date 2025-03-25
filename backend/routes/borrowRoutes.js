const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const librarianAuth = require("../middleware/librarian");
const {
  borrowBook,
  returnBook,
  getUserBorrows,
  getAllBorrows,
  getActiveBorrows,
  getOverdueBooks,
  getBookBorrowHistory,
} = require("../controllers/borrowController");

// Normal kullanıcı işlemleri
router.post("/borrow", auth, borrowBook);
router.get("/my-borrows", auth, getUserBorrows);

// Kütüphaneci ve admin işlemleri (librarianAuth hem librarian hem de superadmin'e izin verir)
router.put("/return/:borrowId", auth, librarianAuth, returnBook);
router.get("/all", auth, librarianAuth, getAllBorrows);
router.get("/active", auth, librarianAuth, getActiveBorrows);
router.get("/overdue", auth, librarianAuth, getOverdueBooks);
router.get("/book/:bookId", auth, librarianAuth, getBookBorrowHistory);

module.exports = router;
