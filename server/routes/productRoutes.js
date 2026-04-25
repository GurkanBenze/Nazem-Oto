const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const Product = require("../models/Product");

// TÜM ÜRÜNLERİ GETİR
router.get("/", async (req, res) => {
  try {
    console.log("products endpoint hit");

    const products = await Product.find().sort({ createdAt: -1 });

    console.log("bulunan ürün:", products.length);

    res.json(products);
  } catch (error) {
    console.error("products hata:", error);

    res.status(500).json({
      message: "Ürünler alınamadı",
      error: error.message,
    });
  }
});

// TEK ÜRÜN GETİR
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Geçersiz ürün ID" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    res.json(product);
  } catch (error) {
    console.error("tek ürün getirme hata:", error);

    res.status(500).json({
      message: "Ürün alınamadı",
      error: error.message,
    });
  }
});

// YENİ ÜRÜN EKLE
router.post("/", async (req, res) => {
  try {
    console.log("POST body:", req.body);

    const yeniUrun = new Product(req.body);
    const kaydedilenUrun = await yeniUrun.save();

    res.status(201).json(kaydedilenUrun);
  } catch (error) {
    console.error("ürün ekleme hata:", error);

    res.status(500).json({
      message: "Ürün eklenemedi",
      error: error.message,
    });
  }
});

// ÜRÜN GÜNCELLE
router.put("/:id", async (req, res) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedProduct) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }
    if (product.aktif === false) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }
    res.json(updatedProduct);
  } catch (error) {
    console.error("ürün güncelleme hata:", error);

    res.status(400).json({
      message: "Ürün güncellenemedi",
      error: error.message,
    });
  }
});

// ÜRÜN SİL
router.delete("/:id", async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);

    if (!deletedProduct) {
      return res.status(404).json({ message: "Ürün bulunamadı" });
    }

    res.json({ message: "Ürün silindi" });
  } catch (error) {
    console.error("ürün silme hata:", error);

    res.status(500).json({
      message: "Ürün silinemedi",
      error: error.message,
    });
  }
});

module.exports = router;
