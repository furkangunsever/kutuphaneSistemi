import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Modal,
  TextField,
  Stack
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  borderRadius: 2
};

const Books = () => {
  const [books, setBooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    ISBN: '',
    quantity: '',
    category: '',
    description: ''
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewBook({
      title: '',
      author: '',
      ISBN: '',
      quantity: '',
      category: '',
      description: ''
    });
  };

  const handleChange = (e) => {
    setNewBook({
      ...newBook,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/books', newBook, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBooks([...books, response.data]);
      handleClose();
    } catch (error) {
      console.error('Kitap eklenirken hata:', error);
    }
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/books');
        setBooks(response.data);
      } catch (error) {
        console.error('Kitaplar yüklenirken hata:', error);
      }
    };

    fetchBooks();
  }, []);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Kitaplar</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Yeni Kitap Ekle
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Başlık</TableCell>
              <TableCell>Yazar</TableCell>
              <TableCell>ISBN</TableCell>
              <TableCell>Kategori</TableCell>
              <TableCell>Stok</TableCell>
              <TableCell>Durum</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book._id}>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.ISBN}</TableCell>
                <TableCell>{book.category}</TableCell>
                <TableCell>{book.quantity}</TableCell>
                <TableCell>{book.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
      >
        <Box sx={modalStyle}>
          <Typography id="modal-modal-title" variant="h6" component="h2" mb={3}>
            Yeni Kitap Ekle
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                name="title"
                label="Kitap Adı"
                value={newBook.title}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="author"
                label="Yazar"
                value={newBook.author}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="ISBN"
                label="ISBN"
                value={newBook.ISBN}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="quantity"
                label="Stok Miktarı"
                type="number"
                value={newBook.quantity}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="category"
                label="Kategori"
                value={newBook.category}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="description"
                label="Açıklama"
                value={newBook.description}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
              />
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleClose}>
                  İptal
                </Button>
                <Button type="submit" variant="contained">
                  Kaydet
                </Button>
              </Box>
            </Stack>
          </form>
        </Box>
      </Modal>
    </Box>
  );
};

export default Books; 