import { ApiResponse } from "../../shared/types";
export declare class SettingsService {
    getSettings(): Promise<ApiResponse>;
    getSetting(key: string): Promise<ApiResponse>;
    updateSetting(key: string, value: any, type?: string): Promise<ApiResponse>;
    updateMultipleSettings(data: Record<string, any>): Promise<ApiResponse>;
    getSystemSettings(): Promise<ApiResponse>;
    updateSystemSettings(data: any): Promise<ApiResponse>;
    getPublicSettings(): Promise<ApiResponse>;
}
//# sourceMappingURL=settings.service.d.ts.map