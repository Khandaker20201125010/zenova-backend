import { ApiResponse } from '../types';
export declare const successResponse: <T>(message: string, data?: T, meta?: any) => ApiResponse<T>;
export declare const errorResponse: (message: string, error?: unknown) => ApiResponse;
export declare const errorMessageResponse: (message: string) => ApiResponse;
export declare const validationErrorResponse: (errors: any[] | string) => ApiResponse;
export declare const getErrorMessage: (error: any) => string;
//# sourceMappingURL=apiResponse.d.ts.map