import multer from 'multer';
import { FileUpload } from '../types/common.types';
export declare class FileHelper {
    static getStorage(): multer.StorageEngine;
    static getFileFilter(allowedMimes: string[]): (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => void;
    static upload: multer.Multer;
    static uploadToCloudinary(file: FileUpload, folder?: string): Promise<string>;
    static uploadMultipleToCloudinary(files: FileUpload[], folder?: string): Promise<string[]>;
}
//# sourceMappingURL=file.helper.d.ts.map