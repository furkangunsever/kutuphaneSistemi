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
  MenuItem,
  Stack,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
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

const Users = () => {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setNewUser({
      name: "",
      email: "",
      password: "",
      role: "user",
    });
  };

  const handleEditOpen = (user) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setSelectedUser(null);
  };

  const handleDeleteOpen = (user) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setSelectedUser(null);
  };

  const handleChange = (e) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value,
    });
  };

  const handleEditChange = (e) => {
    setSelectedUser({
      ...selectedUser,
      [e.target.name]: e.target.value,
    });
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:5000/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      console.error(
        "Kullanıcılar yüklenirken hata:",
        error.response?.data || error
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:5000/api/auth/register", newUser, {
        headers: { Authorization: `Bearer ${token}` },
      });
      handleClose();
      fetchUsers();
    } catch (error) {
      console.error("Kullanıcı eklenirken hata:", error);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        { name: selectedUser.name, role: selectedUser.role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      handleEditClose();
      fetchUsers();
    } catch (error) {
      console.error("Kullanıcı güncellenirken hata:", error);
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(
        `http://localhost:5000/api/users/${selectedUser._id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      handleDeleteClose();
      fetchUsers();
    } catch (error) {
      console.error("Kullanıcı silinirken hata:", error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const getRoleColor = (role) => {
    switch (role) {
      case "superadmin":
        return "error";
      case "librarian":
        return "primary";
      default:
        return "default";
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4">Kullanıcılar</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpen}
        >
          Yeni Kullanıcı
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>İsim</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Kayıt Tarihi</TableCell>
              <TableCell>İşlemler</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user._id}>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Chip
                    label={user.role}
                    color={getRoleColor(user.role)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEditOpen(user)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDeleteOpen(user)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Yeni Kullanıcı Modalı */}
      <Modal open={open} onClose={handleClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" mb={3}>
            Yeni Kullanıcı Ekle
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                name="name"
                label="İsim"
                value={newUser.name}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                value={newUser.email}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="password"
                label="Şifre"
                type="password"
                value={newUser.password}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="role"
                label="Rol"
                select
                value={newUser.role}
                onChange={handleChange}
                required
                fullWidth
              >
                <MenuItem value="user">Kullanıcı</MenuItem>
                <MenuItem value="librarian">Kütüphane Yetkilisi</MenuItem>
                <MenuItem value="superadmin">Süper Admin</MenuItem>
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

      {/* Düzenleme Modalı */}
      <Modal open={editOpen} onClose={handleEditClose}>
        <Box sx={modalStyle}>
          <Typography variant="h6" component="h2" mb={3}>
            Kullanıcı Düzenle
          </Typography>
          <form onSubmit={handleEdit}>
            <Stack spacing={2}>
              <TextField
                name="name"
                label="İsim"
                value={selectedUser?.name || ""}
                onChange={handleEditChange}
                required
                fullWidth
              />
              <TextField
                name="role"
                label="Rol"
                select
                value={selectedUser?.role || "user"}
                onChange={handleEditChange}
                required
                fullWidth
              >
                <MenuItem value="user">Kullanıcı</MenuItem>
                <MenuItem value="librarian">Kütüphane Yetkilisi</MenuItem>
                <MenuItem value="superadmin">Süper Admin</MenuItem>
              </TextField>
              <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button variant="outlined" onClick={handleEditClose}>
                  İptal
                </Button>
                <Button type="submit" variant="contained">
                  Güncelle
                </Button>
              </Box>
            </Stack>
          </form>
        </Box>
      </Modal>

      {/* Silme Onay Dialogu */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Kullanıcı Sil</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedUser?.name} isimli kullanıcıyı silmek istediğinizden emin
            misiniz?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>İptal</Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Users;
