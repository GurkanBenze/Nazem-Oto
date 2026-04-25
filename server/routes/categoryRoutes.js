const express = require("express");
const Category = require("../models/Category");

const router = express.Router();

// Tüm kategorileri getir
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find().sort({ kategoriAdi: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({
      message: "Kategoriler alınamadı",
      error: error.message
    });
  }
});

// Tek kategori getir
router.get("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Kategori bulunamadı" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({
      message: "Kategori alınamadı",
      error: error.message
    });
  }
});

// Yeni kategori ekle
router.post("/", async (req, res) => {
  try {
    const newCategory = new Category(req.body);
    const savedCategory = await newCategory.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(400).json({
      message: "Kategori eklenemedi",
      error: error.message
    });
  }
});

// Kategori güncelle
router.put("/:id", async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Kategori bulunamadı" });
    }

    res.json(updatedCategory);
  } catch (error) {
    res.status(400).json({
      message: "Kategori güncellenemedi",
      error: error.message
    });
  }
});

// Kategori sil
router.delete("/:id", async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ message: "Kategori bulunamadı" });
    }

    res.json({ message: "Kategori silindi" });
  } catch (error) {
    res.status(500).json({
      message: "Kategori silinemedi",
      error: error.message
    });
  }
});

module.exports = router;