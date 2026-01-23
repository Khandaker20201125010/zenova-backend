import { config } from "../../config";
import { sendEmail } from "../../shared/helpers/email";
import logger from "../../shared/helpers/logger";
import { prisma } from "../../shared/helpers/prisma";
import { ApiResponse } from "../../shared/types";
import { ContactStatus } from "@prisma/client"; // Import the enum
import {
  CreateContactMessageInput,
  UpdateContactMessageInput,
  ContactQueryParams,
} from "./contact.interface";

export class ContactService {
  async createMessage(data: CreateContactMessageInput): Promise<ApiResponse> {
    try {
      const message = await prisma.contactMessage.create({
        data,
      });

      // Send notification to admin
      const adminEmail = config.EMAIL.FROM;
      const subject = `New Contact Message: ${data.subject}`;
      const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Message Received</h2>
          <p><strong>From:</strong> ${data.name} (${data.email})</p>
          <p><strong>Subject:</strong> ${data.subject}</p>
          <p><strong>Message:</strong></p>
          <p>${data.message}</p>
          <br>
          <p>You can respond to this message through the admin dashboard.</p>
        </div>
      `;

      try {
        await sendEmail(adminEmail, subject, html);
      } catch (emailError: any) {
        logger.error("Failed to send contact notification:", emailError);
      }

      return {
        success: true,
        message: "Message sent successfully",
        data: message,
      };
    } catch (error: any) {
      logger.error("Create contact message error:", error);
      throw error;
    }
  }

  async getMessages(params: ContactQueryParams): Promise<ApiResponse> {
    try {
      const {
        page = 1,
        limit = 10,
        status,
        search,
        startDate,
        endDate,
        sortBy = "createdAt",
        sortOrder = "desc",
      } = params;

      const skip = (page - 1) * limit;

      // Build where clause
      const where: any = {};

      if (status) {
        // Validate status is a valid enum value
        if (Object.values(ContactStatus).includes(status)) {
          where.status = status;
        } else {
          return {
            success: false,
            message: `Invalid status. Must be one of: ${Object.values(ContactStatus).join(", ")}`,
          };
        }
      }

      if (search) {
        where.OR = [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { subject: { contains: search, mode: "insensitive" } },
          { message: { contains: search, mode: "insensitive" } },
        ];
      }

      if (startDate || endDate) {
        where.createdAt = {};
        if (startDate) where.createdAt.gte = new Date(startDate);
        if (endDate) where.createdAt.lte = new Date(endDate);
      }

      // Get messages
      const [messages, total] = await Promise.all([
        prisma.contactMessage.findMany({
          where,
          skip,
          take: limit,
          orderBy: { [sortBy]: sortOrder },
        }),
        prisma.contactMessage.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        success: true,
        message: "Messages retrieved successfully",
        data: messages,
        meta: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error: any) {
      logger.error("Get contact messages error:", error);
      throw error;
    }
  }

  async getMessageById(id: string): Promise<ApiResponse> {
    try {
      const message = await prisma.contactMessage.findUnique({
        where: { id },
      });

      if (!message) {
        return {
          success: false,
          message: "Message not found",
        };
      }

      return {
        success: true,
        message: "Message retrieved successfully",
        data: message,
      };
    } catch (error: any) {
      logger.error("Get contact message by ID error:", error);
      throw error;
    }
  }

  async updateMessage(
    id: string,
    data: UpdateContactMessageInput,
  ): Promise<ApiResponse> {
    try {
      const message = await prisma.contactMessage.findUnique({
        where: { id },
      });

      if (!message) {
        return {
          success: false,
          message: "Message not found",
        };
      }

      // Validate status if provided
      if (data.status && !Object.values(ContactStatus).includes(data.status)) {
        return {
          success: false,
          message: `Invalid status. Must be one of: ${Object.values(ContactStatus).join(", ")}`,
        };
      }

      const updatedMessage = await prisma.contactMessage.update({
        where: { id },
        data,
      });

      // If response is provided, send email to the sender
      if (data.response && data.status === ContactStatus.RESPONDED) {
        const subject = `Re: ${message.subject}`;
        const html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Response to your message</h2>
            <p>Dear ${message.name},</p>
            <p>Thank you for contacting us. Here's our response:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;">
              ${data.response}
            </div>
            <p>If you have any further questions, please don't hesitate to contact us again.</p>
            <br>
            <p>Best regards,<br>The Support Team</p>
          </div>
        `;

        try {
          await sendEmail(message.email, subject, html);
        } catch (emailError: any) {
          logger.error("Failed to send response email:", emailError);
        }
      }

      return {
        success: true,
        message: "Message updated successfully",
        data: updatedMessage,
      };
    } catch (error: any) {
      logger.error("Update contact message error:", error);
      throw error;
    }
  }

  async deleteMessage(id: string): Promise<ApiResponse> {
    try {
      const message = await prisma.contactMessage.findUnique({
        where: { id },
      });

      if (!message) {
        return {
          success: false,
          message: "Message not found",
        };
      }

      await prisma.contactMessage.delete({
        where: { id },
      });

      return {
        success: true,
        message: "Message deleted successfully",
      };
    } catch (error: any) {
      logger.error("Delete contact message error:", error);
      throw error;
    }
  }

  async getContactStats(): Promise<ApiResponse> {
    try {
      const [
        totalMessages,
        unreadMessages,
        respondedMessages,
        archivedMessages,
        messagesToday,
        messagesThisWeek,
      ] = await Promise.all([
        prisma.contactMessage.count(),
        prisma.contactMessage.count({
          where: { status: ContactStatus.UNREAD },
        }),
        prisma.contactMessage.count({
          where: { status: ContactStatus.RESPONDED },
        }),
        prisma.contactMessage.count({
          where: { status: ContactStatus.ARCHIVED },
        }),
        prisma.contactMessage.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setHours(0, 0, 0, 0)),
            },
          },
        }),
        prisma.contactMessage.count({
          where: {
            createdAt: {
              gte: new Date(new Date().setDate(new Date().getDate() - 7)),
            },
          },
        }),
      ]);

      const stats = {
        totalMessages,
        unreadMessages,
        respondedMessages,
        archivedMessages,
        messagesToday,
        messagesThisWeek,
      };

      return {
        success: true,
        message: "Contact stats retrieved successfully",
        data: stats,
      };
    } catch (error: any) {
      logger.error("Get contact stats error:", error);
      throw error;
    }
  }

  async getFaqs(category?: string): Promise<ApiResponse> {
    try {
      const where: any = { isActive: true };

      if (category) {
        where.category = category;
      }

      const faqs = await prisma.fAQ.findMany({
        where,
        orderBy: { order: "asc" },
      });

      // Group by category
      const groupedFaqs = faqs.reduce(
        (acc, faq) => {
          if (!acc[faq.category]) {
            acc[faq.category] = [];
          }
          acc[faq.category].push(faq);
          return acc;
        },
        {} as Record<string, any[]>,
      );

      return {
        success: true,
        message: "FAQs retrieved successfully",
        data: groupedFaqs,
      };
    } catch (error: any) {
      logger.error("Get FAQs error:", error);
      throw error;
    }
  }

  async createFaq(data: any): Promise<ApiResponse> {
    try {
      const faq = await prisma.fAQ.create({
        data,
      });

      return {
        success: true,
        message: "FAQ created successfully",
        data: faq,
      };
    } catch (error: any) {
      logger.error("Create FAQ error:", error);
      throw error;
    }
  }

  async updateFaq(id: string, data: any): Promise<ApiResponse> {
    try {
      const faq = await prisma.fAQ.findUnique({
        where: { id },
      });

      if (!faq) {
        return {
          success: false,
          message: "FAQ not found",
        };
      }

      const updatedFaq = await prisma.fAQ.update({
        where: { id },
        data,
      });

      return {
        success: true,
        message: "FAQ updated successfully",
        data: updatedFaq,
      };
    } catch (error: any) {
      logger.error("Update FAQ error:", error);
      throw error;
    }
  }

  async deleteFaq(id: string): Promise<ApiResponse> {
    try {
      const faq = await prisma.fAQ.findUnique({
        where: { id },
      });

      if (!faq) {
        return {
          success: false,
          message: "FAQ not found",
        };
      }

      await prisma.fAQ.delete({
        where: { id },
      });

      return {
        success: true,
        message: "FAQ deleted successfully",
      };
    } catch (error: any) {
      logger.error("Delete FAQ error:", error);
      throw error;
    }
  }
}
