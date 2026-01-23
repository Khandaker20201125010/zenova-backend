import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ContactService } from "./contact.service";
import { errorResponse } from "../../shared/helpers/apiResponse";
import { AuthRequest } from "../../shared/types";

const contactService = new ContactService();

export class ContactController {
  async createMessage(req: Request, res: Response): Promise<Response> {
    try {
      const result = await contactService.createMessage(req.body);
      return res.status(StatusCodes.CREATED).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to create contact message", error.message));
    }
  }

  async getMessages(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const result = await contactService.getMessages(req.query);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get messages", error.message));
    }
  }

  async getMessageById(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await contactService.getMessageById(id);

      if (!result.success) {
        return res.status(StatusCodes.NOT_FOUND).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get message", error.message));
    }
  }

  async updateMessage(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await contactService.updateMessage(id, req.body);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to update message", error.message));
    }
  }

  async deleteMessage(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await contactService.deleteMessage(id);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to delete message", error.message));
    }
  }

  async getContactStats(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const result = await contactService.getContactStats();
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get contact stats", error.message));
    }
  }

  async getFaqs(req: Request, res: Response): Promise<Response> {
    try {
      const { category } = req.query;
      const result = await contactService.getFaqs(category as string);
      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to get FAQs", error.message));
    }
  }

  async createFaq(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      const result = await contactService.createFaq(req.body);
      return res.status(StatusCodes.CREATED).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to create FAQ", error.message));
    }
  }

  async updateFaq(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await contactService.updateFaq(id, req.body);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to update FAQ", error.message));
    }
  }

  async deleteFaq(req: AuthRequest, res: Response): Promise<Response> {
    try {
      if (!req.user || req.user.role !== "ADMIN") {
        return res
          .status(StatusCodes.FORBIDDEN)
          .json(errorResponse("Insufficient permissions"));
      }

      // Fix: Handle string or string[] for id
      const id = Array.isArray(req.params.id)
        ? req.params.id[0]
        : req.params.id;
      const result = await contactService.deleteFaq(id);

      if (!result.success) {
        return res.status(StatusCodes.BAD_REQUEST).json(result);
      }

      return res.status(StatusCodes.OK).json(result);
    } catch (error: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(errorResponse("Failed to delete FAQ", error.message));
    }
  }
}
