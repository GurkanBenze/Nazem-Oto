const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    kategoriAdi: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    altKategoriler: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Category || mongoose.model("Category", categorySchema);