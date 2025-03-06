const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const librarianAuth = require("../middleware/librarian");
const {
  addBook,
  lendBook,
  receiveBook,
  extendBorrowPeriod,
  getAllBorrows,
} = require("../controllers/librarianController");
const upload = require("../config/multerConfig");

// Kitap işlemleri
router.post("/books", auth, librarianAuth, addBook);

// Kitap ekleme - şimdi multer middleware'i ile
router.post("/books/add", auth, upload.single("image"), addBook);

// Ödünç işlemleri
router.post("/lend", auth, librarianAuth, lendBook);
router.put("/receive/:borrowId", auth, librarianAuth, receiveBook);
router.put("/extend/:borrowId", auth, librarianAuth, extendBorrowPeriod);
router.get("/borrows", auth, librarianAuth, getAllBorrows);

module.exports = router;
