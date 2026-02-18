export interface CreateReviewInput {
    productId: string;
    rating: number;
    comment?: string;
}
export interface UpdateReviewInput {
    rating?: number;
    comment?: string;
}
export interface ReviewQueryParams {
    page?: number;
    limit?: number;
    productId?: string;
    userId?: string;
    minRating?: number;
    maxRating?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
//# sourceMappingURL=review.interface.d.ts.map