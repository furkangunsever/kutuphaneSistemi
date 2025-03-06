const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const librarianAuth = require("../middleware/librarian");
const {
  getAllBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook,
} = require("../controllers/bookController");

// Herkese açık rotalar
router.get("/", getAllBooks);
router.get("/:id", getBook);

// Sadece kütüphaneci ve süper admin yetkisi gerektiren rotalar
router.post("/", auth, librarianAuth, createBook);
router.put("/:id", auth, librarianAuth, updateBook);
router.delete("/:id", auth, librarianAuth, deleteBook);

module.exports = router;
