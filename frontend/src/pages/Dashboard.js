import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import {
  Book as BookIcon,
  Person as PersonIcon,
  SwapHoriz as SwapIcon
} from '@mui/icons-material';

const StatCard = ({ title, value, icon }) => (
  <Paper
    sx={{
      p: 3,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
      bgcolor: 'primary.light',
      color: 'white'
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      {icon}
      <Typography variant="h4">{value}</Typography>
    </Box>
    <Typography variant="h6" sx={{ mt: 2 }}>
      {title}
    </Typography>
  </Paper>
);

const Dashboard = () => {
  return (
    <>
      <Typography variant="h4" sx={{ mb: 5 }}>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Toplam Kitap"
            value="150"
            icon={<BookIcon sx={{ fontSize: 40 }} />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Toplam Kullanıcı"
            value="45"
            icon={<PersonIcon sx={{ fontSize: 40 }} />}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            title="Ödünç İşlemleri"
            value="23"
            icon={<SwapIcon sx={{ fontSize: 40 }} />}
          />
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard; 