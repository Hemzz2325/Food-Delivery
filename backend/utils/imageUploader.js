import cloudinaryConfig from "./cloudinary.js";

// Wrapper to provide a consistent object with secure_url property
export async function uploadToCloudinary(filePath) {
  try {
    const result = await cloudinaryConfig(filePath);
    // cloudinaryConfig currently returns secure_url string; normalize to object
    return { secure_url: result };
  } catch (err) {
    console.error("uploadToCloudinary error:", err);
    throw err;
  }
}
