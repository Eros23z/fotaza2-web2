const multer = require('multer');
const path = require('path');

const storage = multer.memoryStorage();

fileFilter = (req, file, cb) => {
    const filetypes = ['.jpg', '.png', '.webp'];
    const extname = path.extname(file.originalname).toLowerCase();
    if (filetypes.includes(extname)) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos .jpg, .png, .webp'));
    }
}

const upload = multer({ storage: storage, fileFilter: fileFilter });

module.exports = upload;