// config/db.js
import mongoose from "mongoose";

const connectDb = async () => {
  try {
    const url = process.env.MONGODB_URL;
    if (!url) throw new Error("MONGODB_URL not defined");
    await mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Database of country-kitchen Connected Boss");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

export default connectDb;




