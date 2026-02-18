import { Response } from 'express';
export declare class ValidationHelper {
    static validate<T>(schema: any, data: any): {
        success: boolean;
        data?: T;
        errors?: any[];
    };
    static handleValidationError(res: Response, validationResult: {
        success: boolean;
        errors?: any[];
    }): boolean;
}
//# sourceMappingURL=validation.helper.d.ts.map