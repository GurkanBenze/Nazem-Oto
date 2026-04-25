const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      trim: true,
      default: "",
    },
    aracMarkasi: {
      type: String,
      required: true,
      trim: true,
    },
    urunKategori: {
      type: String,
      required: true,
      trim: true,
    },
    urunAltKategori: {
      type: String,
      default: "",
      trim: true,
    },
    urunAdi: {
      type: String,
      required: true,
      trim: true,
    },
    urunBarkodu: {
      type: String,
      default: "",
      trim: true,
    },
    urunOEM: {
      type: String,
      default: "",
      trim: true,
    },
    urunKodu: {
      type: String,
      default: "",
      trim: true,
    },
    urunMarkasi: {
      type: String,
      default: "",
      trim: true,
    },
    urunModeli: {
      type: String,
      default: "",
      trim: true,
    },
    urunYili: {
      type: String,
      default: "",
      trim: true,
    },
    urunAciklama: {
      type: String,
      default: "",
      trim: true,
    },
    uyumluAraclar: {
      type: String,
      default: "",
      trim: true,
    },
    urunFiyati: {
      type: Number,
      default: 0,
      min: 0,
    },
    urunStogu: {
      type: Number,
      default: 0,
      min: 0,
    },

    aktif: {
      type: Boolean,
      default: true,
    },

    alisFiyati: {
      type: Number,
      default: 0,
      min: 0,
    },
    karMarji: {
      type: Number,
      default: 0,
      min: 0,
    },
    urunGorselData: {
      type: String,
      default: "",
    },
  },

  {
    timestamps: true,
  },
);

module.exports =
  mongoose.models.Product || mongoose.model("Product", productSchema);
