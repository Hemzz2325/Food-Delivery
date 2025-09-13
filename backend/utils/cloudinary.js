import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadToCloudinary(file) {
    try {
        const result = await cloudinary.uploader.upload(file);

        // delete local file
        if (fs.existsSync(file)) fs.unlinkSync(file);

        // return **string only**
        return result.secure_url; 
    } catch (err) {
        if (fs.existsSync(file)) fs.unlinkSync(file);
        console.error("Cloudinary upload error:", err);
        throw err;
    }
}

export default uploadToCloudinary;
