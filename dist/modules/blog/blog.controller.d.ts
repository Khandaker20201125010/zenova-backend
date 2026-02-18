import { Request, Response } from "express";
import { AuthRequest } from "../../shared/types";
export declare class BlogController {
    createPost(req: AuthRequest, res: Response): Promise<Response>;
    getPosts(req: Request, res: Response): Promise<Response>;
    getPostBySlug(req: Request, res: Response): Promise<Response>;
    getPostById(req: AuthRequest, res: Response): Promise<Response>;
    updatePost(req: AuthRequest, res: Response): Promise<Response>;
    deletePost(req: AuthRequest, res: Response): Promise<Response>;
    getFeaturedPosts(req: Request, res: Response): Promise<Response>;
    getRecentPosts(req: Request, res: Response): Promise<Response>;
    getCategories(req: Request, res: Response): Promise<Response>;
    getTags(req: Request, res: Response): Promise<Response>;
    getBlogStats(req: AuthRequest, res: Response): Promise<Response>;
    uploadCoverImage(req: AuthRequest, res: Response): Promise<Response>;
}
//# sourceMappingURL=blog.controller.d.ts.map