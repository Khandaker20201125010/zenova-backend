import { Role, UserStatus, SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { Request } from 'express';
export interface JwtPayload {
    userId: string;
    email: string;
    role: Role;
}
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
        role: Role;
    };
}
export interface PaginationParams {
    page: number;
    limit: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
}
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string | any[];
    meta?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}
export interface CloudinaryUploadResult {
    public_id: string;
    version: number;
    signature: string;
    width: number;
    height: number;
    format: string;
    resource_type: string;
    url: string;
    secure_url: string;
}
export type UserRole = Role;
export type UserStatusType = UserStatus;
export type SubscriptionPlanType = SubscriptionPlan;
export type SubscriptionStatusType = SubscriptionStatus;
//# sourceMappingURL=index.d.ts.map