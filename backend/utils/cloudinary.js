// utils/cloudinary.js (optional)
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinaryRaw(filePath, options = {}) {
  try {
    const result = await cloudinary.uploader.upload(filePath, options);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    return result;
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    throw err;
  }
}

export default cloudinary;
