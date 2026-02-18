export interface UpdateProfileInput {
    name?: string;
    phone?: string;
    company?: string;
    position?: string;
    bio?: string;
    avatar?: string;
}
export interface UpdateEmailInput {
    email: string;
    currentPassword: string;
}
export interface ToggleTwoFactorInput {
    enabled: boolean;
}
export interface UserQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=user.interface.d.ts.map