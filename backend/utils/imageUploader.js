// utils/imageUploader.js
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(filePath) {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder: "food_items",
    });

    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    return { secure_url: result.secure_url };
  } catch (err) {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    console.error("uploadToCloudinary error:", err);
    throw new Error("Failed to upload image to Cloudinary");
  }
}

export default uploadToCloudinary;
