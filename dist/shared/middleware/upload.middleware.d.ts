import multer from 'multer';
import { NextFunction, Request } from 'express';
export declare const debugUpload: (req: Request, res: Response, next: NextFunction) => void;
export declare const uploadMiddleware: {
    single: (fieldName?: string) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    multiple: (fieldName?: string, maxCount?: number) => import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    avatar: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    coverImage: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    productImages: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
    instance: multer.Multer;
};
//# sourceMappingURL=upload.middleware.d.ts.map