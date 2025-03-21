import React, { useState, useEffect } from "react";
import { Grid, Paper, Typography, Box, CircularProgress } from "@mui/material";
import {
  Book as BookIcon,
  Person as PersonIcon,
  SwapHoriz as SwapIcon,
  Inventory as StockIcon,
} from "@mui/icons-material";
import axios from "axios";

const StatCard = ({ title, value, icon, isLoading }) => (
  <Paper
    sx={{
      p: 3,
      display: "flex",
      flexDirection: "column",
      height: 140,
      bgcolor: "primary.light",
      color: "white",
    }}
  >
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      {icon}
      {isLoading ? (
        <CircularProgress size={24} color="inherit" />
      ) : (
        <Typography variant="h4">{value}</Typography>
      )}
    </Box>
    <Typography variant="h6" sx={{ mt: 2 }}>
      {title}
    </Typography>
  </Paper>
);

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          "http://localhost:5000/api/dashboard/stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setStats(response.data);
        setLoading(false);
      } catch (error) {
        console.error("İstatistikler yüklenirken hata:", error);
        setError("İstatistikler yüklenirken bir hata oluştu");
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (error) {
    return (
      <Typography
        color="error"
        variant="h6"
        sx={{ textAlign: "center", mt: 4 }}
      >
        {error}
      </Typography>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" sx={{ mb: 4 }}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Toplam Kitap"
            value={stats?.totalBooks || 0}
            icon={<BookIcon sx={{ fontSize: 40 }} />}
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Toplam Stok"
            value={stats?.totalStock || 0}
            icon={<StockIcon sx={{ fontSize: 40 }} />}
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Toplam Kullanıcı"
            value={(stats?.totalUsers - 1) || 0}
            icon={<PersonIcon sx={{ fontSize: 40 }} />}
            isLoading={loading}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            title="Aktif Ödünç"
            value={stats?.activeBorrows || 0}
            icon={<SwapIcon sx={{ fontSize: 40 }} />}
            isLoading={loading}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
