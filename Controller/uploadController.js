// /uploadController.js
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// สร้างโฟลเดอร์ถ้ายังไม่มี
const uploadPath = path.join(__dirname, "../uploads/products");
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// ตั้งค่า multer สำหรับอัปโหลดภาพ
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        const fileName = `${Date.now()}${ext}`;
        cb(null, fileName);
    },
});

const upload = multer({
    storage,
    fileFilter(req, file, cb) {
        const allowed = ["image/jpeg", "image/png"];
        if (!allowed.includes(file.mimetype)) {
            return cb(new Error("Only .jpg and .png are allowed"));
        }
        cb(null, true);
    },
});

exports.uploadProductImage = upload.single("image");
