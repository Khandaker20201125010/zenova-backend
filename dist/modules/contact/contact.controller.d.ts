import { Request, Response } from "express";
import { AuthRequest } from "../../shared/types";
export declare class ContactController {
    createMessage(req: Request, res: Response): Promise<Response>;
    getMessages(req: AuthRequest, res: Response): Promise<Response>;
    getMessageById(req: AuthRequest, res: Response): Promise<Response>;
    updateMessage(req: AuthRequest, res: Response): Promise<Response>;
    deleteMessage(req: AuthRequest, res: Response): Promise<Response>;
    getContactStats(req: AuthRequest, res: Response): Promise<Response>;
    getFaqs(req: Request, res: Response): Promise<Response>;
    createFaq(req: AuthRequest, res: Response): Promise<Response>;
    updateFaq(req: AuthRequest, res: Response): Promise<Response>;
    deleteFaq(req: AuthRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=contact.controller.d.ts.map