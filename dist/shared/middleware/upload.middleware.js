"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadMiddleware = exports.debugUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const cloudinary_1 = require("cloudinary");
const multer_storage_cloudinary_1 = require("multer-storage-cloudinary");
// Configure Cloudinary
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// Create storage with proper params
const storage = new multer_storage_cloudinary_1.CloudinaryStorage({
    cloudinary: cloudinary_1.v2,
    params: {
        folder: 'saas-platform',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
        resource_type: 'auto',
        // Use the original filename
        public_id: (req, file) => {
            // Remove file extension and add timestamp for uniqueness
            const name = file.originalname.split('.')[0];
            const timestamp = Date.now();
            return `${name}-${timestamp}`;
        },
    },
});
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
        return cb(null, true);
    }
    else {
        cb(new Error('Only image files are allowed'));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
    fileFilter: fileFilter,
});
// Debug middleware to see what's in req.file
const debugUpload = (req, res, next) => {
    console.log('File upload debug:');
    console.log('req.file:', req.file);
    console.log('req.files:', req.files);
    next();
};
exports.debugUpload = debugUpload;
// Unified upload object with all methods
exports.uploadMiddleware = {
    // Single file uploads with different field names
    single: (fieldName = 'image') => upload.single(fieldName),
    // Multiple files upload
    multiple: (fieldName = 'images', maxCount = 10) => upload.array(fieldName, maxCount),
    // Specific presets for common use cases
    avatar: upload.single('avatar'),
    coverImage: upload.single('coverImage'),
    productImages: upload.array('images', 10),
    // Raw multer instance for advanced use
    instance: upload
};
//# sourceMappingURL=upload.middleware.js.map