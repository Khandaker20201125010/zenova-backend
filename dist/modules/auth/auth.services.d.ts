import { LoginInput, RegisterInput, SocialLoginInput, AuthResponse, ChangePasswordInput } from "./auth.interface";
import { ApiResponse } from "../../shared/types";
export declare class AuthService {
    register(data: RegisterInput): Promise<ApiResponse<AuthResponse>>;
    login(data: LoginInput): Promise<ApiResponse<AuthResponse>>;
    socialLogin(data: SocialLoginInput): Promise<ApiResponse<AuthResponse>>;
    refreshToken(refreshToken: string): Promise<ApiResponse<{
        token: string;
        refreshToken: string;
    }>>;
    logout(refreshToken: string, userId: string): Promise<ApiResponse>;
    requestPasswordReset(email: string): Promise<ApiResponse>;
    resetPassword(token: string, newPassword: string): Promise<ApiResponse>;
    changePassword(userId: string, data: ChangePasswordInput): Promise<ApiResponse>;
    demoLogin(): Promise<ApiResponse<AuthResponse>>;
}
//# sourceMappingURL=auth.services.d.ts.map