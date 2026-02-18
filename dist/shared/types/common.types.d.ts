export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: ApiError[];
    meta?: PaginationMeta;
}
export interface ApiError {
    code: string;
    message: string;
    field?: string;
}
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface FilterParams {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    isFeatured?: boolean;
    status?: string;
    [key: string]: any;
}
export interface FileUpload {
    fieldname: string;
    originalname: string;
    encoding: string;
    mimetype: string;
    size: number;
    destination: string;
    filename: string;
    path: string;
}
//# sourceMappingURL=common.types.d.ts.map