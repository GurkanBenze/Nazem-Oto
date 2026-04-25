require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const productRoutes = require("./routes/productRoutes");
const categoryRoutes = require("./routes/categoryRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API route'ları
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);

// Statik dosyalar
app.use(express.static(path.join(__dirname, "..", "public")));

// Test endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server çalışıyor",
    time: new Date().toISOString()
  });
});

// Ana sayfa
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

const PORT = process.env.PORT || 5000;

// Önce DB bağlan, sonra server aç
connectDB()
  .then(() => {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server ${PORT} portunda çalışıyor`);
    });
  })
  .catch((error) => {
    console.error("Uygulama başlatılamadı:", error);
    process.exit(1);
  });