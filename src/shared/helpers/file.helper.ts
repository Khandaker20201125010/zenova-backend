import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import cloudinary from '../../config/cloudinary';
import { FileUpload } from '../types/common.types';

export class FileHelper {
  static getStorage() {
    return multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, 'uploads/');
      },
      filename: (req, file, cb) => {
        const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
      },
    });
  }

  static getFileFilter(allowedMimes: string[]) {
    return (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Invalid file type. Only ${allowedMimes.join(', ')} are allowed.`));
      }
    };
  }

  static upload = multer({
    storage: FileHelper.getStorage(),
    fileFilter: FileHelper.getFileFilter(['image/jpeg', 'image/png', 'image/jpg', 'image/webp']),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });

  static async uploadToCloudinary(file: FileUpload, folder: string = 'saas-platform') {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'auto',
      });
      return result.secure_url;
    } catch (error) {
      throw new Error('Failed to upload file to cloudinary');
    }
  }

  static async uploadMultipleToCloudinary(files: FileUpload[], folder: string = 'saas-platform') {
    const uploadPromises = files.map((file) => this.uploadToCloudinary(file, folder));
    return Promise.all(uploadPromises);
  }
}