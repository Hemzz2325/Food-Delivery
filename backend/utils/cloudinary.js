import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Upload a file to Cloudinary and return an object containing secure_url
export async function uploadToCloudinary(file) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    try {
        const result = await cloudinary.uploader.upload(file);
        // remove local file if exists
        try {
            if (fs.existsSync(file)) fs.unlinkSync(file);
        } catch (e) {
            console.warn('Failed to remove temp file', e);
        }
        return { secure_url: result.secure_url };
    } catch (err) {
        console.error('Cloudinary upload error:', err);
        // attempt cleanup
        try {
            if (fs.existsSync(file)) fs.unlinkSync(file);
        } catch (e) {
            /* ignore */
        }
        throw err;
    }
}

export default uploadToCloudinary;