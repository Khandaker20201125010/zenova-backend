import { Request, Response } from 'express';
import { ApiResponse } from '../types';
export declare const errorHandler: (error: any, req: Request, res: Response<ApiResponse>) => Response<ApiResponse<any>, Record<string, any>>;
export declare const notFoundHandler: (req: Request, res: Response<ApiResponse>) => void;
//# sourceMappingURL=error.middleware.d.ts.map