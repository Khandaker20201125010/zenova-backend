import { ApiResponse } from "../../shared/types";
export declare class ReviewService {
    createReview(userId: string, productId: string, rating: number, comment?: string): Promise<ApiResponse>;
    getProductReviews(productId: string, page?: number, limit?: number): Promise<ApiResponse>;
    getUserReviews(userId: string, page?: number, limit?: number): Promise<ApiResponse>;
    updateReview(id: string, userId: string, data: {
        rating?: number;
        comment?: string;
    }): Promise<ApiResponse>;
    deleteReview(id: string, userId: string): Promise<ApiResponse>;
    getRecentReviews(limit?: number): Promise<ApiResponse>;
    getReviewStats(): Promise<ApiResponse>;
    getAllReviews(page?: number, limit?: number): Promise<ApiResponse>;
}
//# sourceMappingURL=review.service.d.ts.map