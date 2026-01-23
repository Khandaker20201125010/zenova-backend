import { Request, Response, NextFunction } from "express";
import { ZodObject, ZodTypeAny } from "zod";

export const validate =
  (schema: ZodObject<any> | ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies,
      });
      next();
    } catch (error) {
      next(error);
    }
  };
