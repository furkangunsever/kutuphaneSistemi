const path = require("path");
const notificationRoutes = require("./routes/notificationRoutes");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Bildirim rotaları
app.use("/api/notifications", notificationRoutes);
