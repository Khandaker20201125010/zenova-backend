import { Request, Response } from "express";
import { AuthRequest } from "../../shared/types";
export declare class CategoryController {
    createCategory(req: AuthRequest, res: Response): Promise<Response>;
    getCategories(req: Request, res: Response): Promise<Response>;
    getCategoryBySlug(req: Request, res: Response): Promise<Response>;
    updateCategory(req: AuthRequest, res: Response): Promise<Response>;
    deleteCategory(req: AuthRequest, res: Response): Promise<Response>;
    getCategoryTree(req: Request, res: Response): Promise<Response>;
    getCategoryProducts(req: Request, res: Response): Promise<Response>;
}
//# sourceMappingURL=category.controller.d.ts.map