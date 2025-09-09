const multer = require('multer');

// Menggunakan memory storage agar file tidak disimpan ke disk
const storage = multer.memoryStorage();

// File filter untuk hanya menerima gambar
const fileFilter = (req, file, cb) => {
    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files (JPEG, JPG, PNG, GIF) are allowed'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

const uploadMiddleware = (req, res, next) => {
    upload.single('proof')(req, res, (err) => {
        if (err) {
            if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({
                        success: false,
                        message: 'File terlalu besar. Maksimal 5MB'
                    });
                }
                return res.status(400).json({
                    success: false,
                    message: `File upload error: ${err.message}`
                });
            }
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }

        // Validasi apakah file ada
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Bukti pembayaran harus diupload'
            });
        }

        console.log('File received:', {
            fieldname: req.file.fieldname,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        next();
    });
};

module.exports = uploadMiddleware;
