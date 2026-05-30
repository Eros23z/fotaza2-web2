const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

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