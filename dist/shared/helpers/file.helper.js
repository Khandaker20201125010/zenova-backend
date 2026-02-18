"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileHelper = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const uuid_1 = require("uuid");
const cloudinary_1 = __importDefault(require("../../config/cloudinary"));
class FileHelper {
    static getStorage() {
        return multer_1.default.diskStorage({
            destination: (req, file, cb) => {
                cb(null, 'uploads/');
            },
            filename: (req, file, cb) => {
                const uniqueName = `${(0, uuid_1.v4)()}${path_1.default.extname(file.originalname)}`;
                cb(null, uniqueName);
            },
        });
    }
    static getFileFilter(allowedMimes) {
        return (req, file, cb) => {
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error(`Invalid file type. Only ${allowedMimes.join(', ')} are allowed.`));
            }
        };
    }
    static async uploadToCloudinary(file, folder = 'saas-platform') {
        try {
            const result = await cloudinary_1.default.uploader.upload(file.path, {
                folder,
                resource_type: 'auto',
            });
            return result.secure_url;
        }
        catch (error) {
            throw new Error('Failed to upload file to cloudinary');
        }
    }
    static async uploadMultipleToCloudinary(files, folder = 'saas-platform') {
        const uploadPromises = files.map((file) => this.uploadToCloudinary(file, folder));
        return Promise.all(uploadPromises);
    }
}
exports.FileHelper = FileHelper;
FileHelper.upload = (0, multer_1.default)({
    storage: FileHelper.getStorage(),
    fileFilter: FileHelper.getFileFilter(['image/jpeg', 'image/png', 'image/jpg', 'image/webp']),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
//# sourceMappingURL=file.helper.js.map