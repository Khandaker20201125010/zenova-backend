import { UpdateProfileInput, UpdateEmailInput, ToggleTwoFactorInput, UserQueryParams } from "./user.interface";
import { ApiResponse } from "../../shared/types";
export declare class UserService {
    getProfile(userId: string): Promise<ApiResponse>;
    updateProfile(userId: string, data: UpdateProfileInput): Promise<ApiResponse>;
    updateEmail(userId: string, data: UpdateEmailInput): Promise<ApiResponse>;
    toggleTwoFactor(userId: string, data: ToggleTwoFactorInput): Promise<ApiResponse>;
    uploadAvatar(userId: string, avatarUrl: string): Promise<ApiResponse>;
    getUsers(params: UserQueryParams): Promise<ApiResponse>;
    getUserById(userId: string): Promise<ApiResponse>;
    updateUserStatus(userId: string, status: string): Promise<ApiResponse>;
    updateUserRole(userId: string, role: string): Promise<ApiResponse>;
    deleteUser(userId: string): Promise<ApiResponse>;
    getUserStats(userId: string): Promise<ApiResponse>;
    getActivities(userId: string, page?: number, limit?: number): Promise<ApiResponse>;
}
//# sourceMappingURL=user.service.d.ts.map