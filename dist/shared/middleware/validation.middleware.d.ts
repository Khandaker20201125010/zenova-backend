import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodTypeAny } from "zod";
export declare const validate: (schema: ZodObject<any> | ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=validation.middleware.d.ts.map