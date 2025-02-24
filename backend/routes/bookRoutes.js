const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getAllBooks,
  getBook,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');

router.get('/', getAllBooks);
router.get('/:id', getBook);
router.post('/', auth, createBook);
router.put('/:id', auth, updateBook);
router.delete('/:id', auth, deleteBook);

module.exports = router; 