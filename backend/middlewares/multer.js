// middlewares/multer.js
import multer from "multer";
import path from "path";
import fs from "fs";

const publicDir = path.join(process.cwd(), "public");

// ensure public dir exists
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, publicDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "-"));
  },
});

export const upload = multer({ storage });
export default upload;
