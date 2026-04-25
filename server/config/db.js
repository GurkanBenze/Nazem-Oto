const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB bağlandı");
  } catch (error) {
    console.error("MongoDB bağlantı hatası:", error.message);
    throw error;
  }
};

module.exports = connectDB;