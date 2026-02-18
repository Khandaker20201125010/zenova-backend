import { Request, Response } from "express";
import { AuthRequest } from "../../shared/types";
export declare class AuthController {
    register(req: Request, res: Response): Promise<Response>;
    login(req: Request, res: Response): Promise<Response>;
    socialLogin(req: Request, res: Response): Promise<Response>;
    refreshToken(req: Request, res: Response): Promise<Response>;
    logout(req: AuthRequest, res: Response): Promise<Response>;
    requestPasswordReset(req: Request, res: Response): Promise<Response>;
    resetPassword(req: Request, res: Response): Promise<Response>;
    changePassword(req: AuthRequest, res: Response): Promise<Response>;
    demoLogin(req: Request, res: Response): Promise<Response>;
    me(req: AuthRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=auth.controller.d.ts.map