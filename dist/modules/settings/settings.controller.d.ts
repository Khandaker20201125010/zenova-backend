import { Request, Response } from "express";
import { AuthRequest } from "../../shared/types";
export declare class SettingsController {
    getSettings(req: AuthRequest, res: Response): Promise<Response>;
    getSetting(req: AuthRequest, res: Response): Promise<Response>;
    updateSetting(req: AuthRequest, res: Response): Promise<Response>;
    updateMultipleSettings(req: AuthRequest, res: Response): Promise<Response>;
    getSystemSettings(req: AuthRequest, res: Response): Promise<Response>;
    updateSystemSettings(req: AuthRequest, res: Response): Promise<Response>;
    getPublicSettings(req: Request, res: Response): Promise<Response>;
    initializeSettings(req: AuthRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=settings.controller.d.ts.map