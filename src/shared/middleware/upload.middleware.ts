import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { NextFunction, Request } from 'express';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Create storage with proper params
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'saas-platform',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }],
    resource_type: 'auto',
    // Use the original filename
    public_id: (req: Request, file: Express.Multer.File) => {
      // Remove file extension and add timestamp for uniqueness
      const name = file.originalname.split('.')[0];
      const timestamp = Date.now();
      return `${name}-${timestamp}`;
    },
  } as any,
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

// Debug middleware to see what's in req.file
export const debugUpload = (req: Request, res: Response, next: NextFunction) => {
  console.log('File upload debug:');
  console.log('req.file:', req.file);
  console.log('req.files:', req.files);
  next();
};

// Unified upload object with all methods
export const uploadMiddleware = {
  // Single file uploads with different field names
  single: (fieldName: string = 'image') => upload.single(fieldName),
  
  // Multiple files upload
  multiple: (fieldName: string = 'images', maxCount: number = 10) => 
    upload.array(fieldName, maxCount),
  
  // Specific presets for common use cases
  avatar: upload.single('avatar'),
  coverImage: upload.single('coverImage'),
  productImages: upload.array('images', 10),
  
  // Raw multer instance for advanced use
  instance: upload
};