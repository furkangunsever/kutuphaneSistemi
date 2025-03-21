import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Avatar,
} from "@mui/material";
import axios from "axios";

const ActiveBorrows = () => {
  const [activeBorrows, setActiveBorrows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchActiveBorrows = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/borrows/active",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setActiveBorrows(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Aktif ödünçler yüklenirken hata:", error);
        setError("Aktif ödünçler yüklenirken bir hata oluştu");
        setLoading(false);
      }
    };

    fetchActiveBorrows();
  }, []);

  const getRemainingDaysColor = (days) => {
    if (days < 0) return "error";
    if (days <= 3) return "warning";
    return "success";
  };

  if (loading) return <Typography>Yükleniyor...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Aktif Ödünç İşlemleri
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Kitap</TableCell>
              <TableCell>Kullanıcı</TableCell>
              <TableCell>Ödünç Alma Tarihi</TableCell>
              <TableCell>İade Tarihi</TableCell>
              <TableCell>Kalan Süre</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeBorrows.map((borrow) => (
              <TableRow key={borrow.id}>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar
                      variant="rounded"
                      src={borrow.bookImage}
                      alt={borrow.bookTitle}
                      sx={{ width: 40, height: 40 }}
                    >
                      {borrow.bookTitle[0]}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2">
                        {borrow.bookTitle}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {borrow.bookAuthor}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2">{borrow.userName}</Typography>
                  <Typography variant="caption" color="textSecondary">
                    {borrow.userEmail}
                  </Typography>
                </TableCell>
                <TableCell>
                  {new Date(borrow.borrowDate).toLocaleDateString("tr-TR")}
                </TableCell>
                <TableCell>
                  {new Date(borrow.dueDate).toLocaleDateString("tr-TR")}
                </TableCell>
                <TableCell>
                  <Chip
                    label={`${borrow.remainingDays} gün`}
                    color={getRemainingDaysColor(borrow.remainingDays)}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ActiveBorrows;
