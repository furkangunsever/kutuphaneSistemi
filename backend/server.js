const dotenv = require("dotenv");
// En başta .env dosyasını yükle
dotenv.config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const fs = require("fs");
const path = require("path");

// Routes
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const borrowRoutes = require("./routes/borrowRoutes");
const librarianRoutes = require("./routes/librarianRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Statik dosyalar için middleware ekle
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Uploads klasörünü oluştur
const uploadsDir = path.join(__dirname, "uploads");
const booksUploadsDir = path.join(__dirname, "uploads/books");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}
if (!fs.existsSync(booksUploadsDir)) {
  fs.mkdirSync(booksUploadsDir);
}

// Database bağlantısı
connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrows", borrowRoutes);
app.use("/api/librarian", librarianRoutes);
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
