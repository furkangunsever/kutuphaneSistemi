import React, { useState, useEffect } from "react";
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
  Stack,
  Chip,
  IconButton,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import axios from "axios";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  borderRadius: 2,
};

const Books = () => {
  const [books, setBooks] = useState([]);
  const [open, setOpen] = useState(false);
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    ISBN: "",
    quantity: "",
    category: "",
    description: "",
    status: "available",
  });
  const [editOpen, setEditOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewBook({
      title: "",
      author: "",
      ISBN: "",
      quantity: "",
      category: "",
      description: "",
      status: "available",
    });
  };

  const handleEditOpen = (book) => {
    setSelectedBook(book);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setSelectedBook(null);
  };

  const handleChange = (e) => {
    setNewBook({
      ...newBook,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    setSelectedBook({
      ...selectedBook,
      status: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "http://localhost:5000/api/books",
        newBook,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBooks([...books, response.data]);
      handleClose();
    } catch (error) {
      console.error("Kitap eklenirken hata:", error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:5000/api/books/${selectedBook._id}`,
        selectedBook,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setBooks(
        books.map((book) =>
          book._id === selectedBook._id ? response.data : book
        )
      );
      handleEditClose();
    } catch (error) {
      console.error("Kitap düzenlenirken hata:", error);
    }
  };

  const handleDelete = async (book) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/books/${book._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBooks(books.filter((b) => b._id !== book._id));
    } catch (error) {
      console.error("Kitap silinirken hata:", error);
    }
  };

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/books");
        setBooks(response.data);
      } catch (error) {
        console.error("Kitaplar yüklenirken hata:", error);
      }
    };

    fetchBooks();
  }, []);

  // Durum çevirileri için yardımcı fonksiyon
  const getStatusText = (status) => {
    switch (status) {
      case "available":
        return "Müsait";
      case "borrowed":
        return "Ödünç Verildi";
      case "reserved":
        return "Rezerve";
      default:
        return "Bilinmiyor";
    }
  };

  // Durum rengini belirleyen fonksiyon
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "success";
      case "borrowed":
        return "error";
      case "reserved":
        return "warning";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
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
              <TableCell>Kitap Adı</TableCell>
              <TableCell>Yazar</TableCell>
              <TableCell>ISBN</TableCell>
              <TableCell>Yayın Yılı</TableCell>
              <TableCell>Stok</TableCell>
              <TableCell>Durum</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book._id}>
                <TableCell>{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>{book.isbn}</TableCell>
                <TableCell>{book.publishYear}</TableCell>
                <TableCell>{book.quantity}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusText(book.status)}
                    color={getStatusColor(book.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditOpen(book)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(book)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
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
              <TextField
                name="status"
                label="Durum"
                select
                value={newBook.status}
                onChange={handleChange}
                required
                fullWidth
              >
                <MenuItem value="available">Müsait</MenuItem>
                <MenuItem value="borrowed">Ödünç Verildi</MenuItem>
                <MenuItem value="reserved">Rezerve</MenuItem>
              </TextField>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
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

      <Modal open={editOpen} onClose={handleEditClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" mb={3}>
            Kitap Düzenle
          </Typography>
          <form onSubmit={handleEdit}>
            <Stack spacing={2}>
              <TextField
                name="title"
                label="Kitap Adı"
                value={selectedBook?.title || ""}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="author"
                label="Yazar"
                value={selectedBook?.author || ""}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="ISBN"
                label="ISBN"
                value={selectedBook?.isbn || ""}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="quantity"
                label="Stok Miktarı"
                type="number"
                value={selectedBook?.quantity || ""}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="category"
                label="Kategori"
                value={selectedBook?.category || ""}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="description"
                label="Açıklama"
                value={selectedBook?.description || ""}
                onChange={handleChange}
                multiline
                rows={4}
                fullWidth
              />
              <TextField
                name="status"
                label="Durum"
                select
                value={selectedBook?.status || "available"}
                onChange={handleEditChange}
                required
                fullWidth
              >
                <MenuItem value="available">Müsait</MenuItem>
                <MenuItem value="borrowed">Ödünç Verildi</MenuItem>
                <MenuItem value="reserved">Rezerve</MenuItem>
              </TextField>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={handleEditClose}>
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
