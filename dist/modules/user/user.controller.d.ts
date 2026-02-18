import { Response } from "express";
import { AuthRequest } from "../../shared/types";
export declare class UserController {
    getProfile(req: AuthRequest, res: Response): Promise<Response>;
    updateProfile(req: AuthRequest, res: Response): Promise<Response>;
    updateEmail(req: AuthRequest, res: Response): Promise<Response>;
    toggleTwoFactor(req: AuthRequest, res: Response): Promise<Response>;
    uploadAvatar(req: AuthRequest, res: Response): Promise<Response>;
    getUsers(req: AuthRequest, res: Response): Promise<Response>;
    getUserById(req: AuthRequest, res: Response): Promise<Response>;
    updateUserStatus(req: AuthRequest, res: Response): Promise<Response>;
    updateUserRole(req: AuthRequest, res: Response): Promise<Response>;
    deleteUser(req: AuthRequest, res: Response): Promise<Response>;
    getUserStats(req: AuthRequest, res: Response): Promise<Response>;
    getActivities(req: AuthRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=user.controller.d.ts.map