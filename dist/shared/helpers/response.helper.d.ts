import { Response } from 'express';
import { PaginationMeta } from '../types/common.types';
export declare class ApiResponseHelper {
    static success<T>(res: Response, data?: T, message?: string, statusCode?: number, meta?: PaginationMeta): Response;
    static error(res: Response, message?: string, statusCode?: number, errors?: any[]): Response;
    static created<T>(res: Response, data?: T, message?: string): Response;
    static notFound(res: Response, message?: string): Response;
    static badRequest(res: Response, message?: string, errors?: any[]): Response;
    static unauthorized(res: Response, message?: string): Response;
    static forbidden(res: Response, message?: string): Response;
    static validationError(res: Response, errors: any[]): Response;
}
//# sourceMappingURL=response.helper.d.ts.map