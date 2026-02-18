import { Request, Response } from "express";
import { AuthRequest } from "../../shared/types";
export declare class ReviewController {
    createReview(req: AuthRequest, res: Response): Promise<Response>;
    getProductReviews(req: Request, res: Response): Promise<Response>;
    getUserReviews(req: AuthRequest, res: Response): Promise<Response>;
    updateReview(req: AuthRequest, res: Response): Promise<Response>;
    deleteReview(req: AuthRequest, res: Response): Promise<Response>;
    getRecentReviews(req: Request, res: Response): Promise<Response>;
    getReviewStats(req: AuthRequest, res: Response): Promise<Response>;
    getAllReviews(req: AuthRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=review.controller.d.ts.map