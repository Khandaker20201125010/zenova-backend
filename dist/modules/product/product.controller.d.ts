import { Request, Response } from "express";
import { AuthRequest } from "../../shared/types";
export declare class ProductController {
    createProduct(req: AuthRequest, res: Response): Promise<Response>;
    getProducts(req: Request, res: Response): Promise<Response>;
    getProductBySlug(req: Request, res: Response): Promise<Response>;
    getProductById(req: AuthRequest, res: Response): Promise<Response>;
    updateProduct(req: AuthRequest, res: Response): Promise<Response>;
    deleteProduct(req: AuthRequest, res: Response): Promise<Response>;
    uploadProductImages(req: AuthRequest, res: Response): Promise<Response>;
    removeProductImage(req: AuthRequest, res: Response): Promise<Response>;
    getRelatedProducts(req: Request, res: Response): Promise<Response>;
    getFeaturedProducts(req: Request, res: Response): Promise<Response>;
    toggleFavorite(req: AuthRequest, res: Response): Promise<Response>;
    getUserFavorites(req: AuthRequest, res: Response): Promise<Response>;
    getProductStats(req: AuthRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=product.controller.d.ts.map