const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const {
  borrowBook,
  returnBook,
  getUserBorrows,
  getAllBorrows,
  getActiveBorrows,
} = require("../controllers/borrowController");

router.post("/borrow", auth, borrowBook);
router.put("/return/:borrowId", auth, returnBook);
router.get("/my-borrows", auth, getUserBorrows);
router.get("/all", auth, admin, getAllBorrows);
router.get("/active", auth, admin, getActiveBorrows);

module.exports = router;
