"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const config_1 = require("../../config");
const email_1 = require("../../shared/helpers/email");
const logger_1 = __importDefault(require("../../shared/helpers/logger"));
const prisma_1 = require("../../shared/helpers/prisma");
const client_1 = require("@prisma/client"); // Import the enum
class ContactService {
    async createMessage(data) {
        try {
            const message = await prisma_1.prisma.contactMessage.create({
                data,
            });
            // Send notification to admin
            const adminEmail = config_1.config.EMAIL.FROM;
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
                await (0, email_1.sendEmail)(adminEmail, subject, html);
            }
            catch (emailError) {
                logger_1.default.error("Failed to send contact notification:", emailError);
            }
            return {
                success: true,
                message: "Message sent successfully",
                data: message,
            };
        }
        catch (error) {
            logger_1.default.error("Create contact message error:", error);
            throw error;
        }
    }
    async getMessages(params) {
        try {
            const { page = 1, limit = 10, status, search, startDate, endDate, sortBy = "createdAt", sortOrder = "desc", } = params;
            const skip = (page - 1) * limit;
            // Build where clause
            const where = {};
            if (status) {
                // Validate status is a valid enum value
                if (Object.values(client_1.ContactStatus).includes(status)) {
                    where.status = status;
                }
                else {
                    return {
                        success: false,
                        message: `Invalid status. Must be one of: ${Object.values(client_1.ContactStatus).join(", ")}`,
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
                if (startDate)
                    where.createdAt.gte = new Date(startDate);
                if (endDate)
                    where.createdAt.lte = new Date(endDate);
            }
            // Get messages
            const [messages, total] = await Promise.all([
                prisma_1.prisma.contactMessage.findMany({
                    where,
                    skip,
                    take: limit,
                    orderBy: { [sortBy]: sortOrder },
                }),
                prisma_1.prisma.contactMessage.count({ where }),
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
        }
        catch (error) {
            logger_1.default.error("Get contact messages error:", error);
            throw error;
        }
    }
    async getMessageById(id) {
        try {
            const message = await prisma_1.prisma.contactMessage.findUnique({
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
        }
        catch (error) {
            logger_1.default.error("Get contact message by ID error:", error);
            throw error;
        }
    }
    async updateMessage(id, data) {
        try {
            const message = await prisma_1.prisma.contactMessage.findUnique({
                where: { id },
            });
            if (!message) {
                return {
                    success: false,
                    message: "Message not found",
                };
            }
            // Validate status if provided
            if (data.status && !Object.values(client_1.ContactStatus).includes(data.status)) {
                return {
                    success: false,
                    message: `Invalid status. Must be one of: ${Object.values(client_1.ContactStatus).join(", ")}`,
                };
            }
            const updatedMessage = await prisma_1.prisma.contactMessage.update({
                where: { id },
                data,
            });
            // If response is provided, send email to the sender
            if (data.response && data.status === client_1.ContactStatus.RESPONDED) {
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
                    await (0, email_1.sendEmail)(message.email, subject, html);
                }
                catch (emailError) {
                    logger_1.default.error("Failed to send response email:", emailError);
                }
            }
            return {
                success: true,
                message: "Message updated successfully",
                data: updatedMessage,
            };
        }
        catch (error) {
            logger_1.default.error("Update contact message error:", error);
            throw error;
        }
    }
    async deleteMessage(id) {
        try {
            const message = await prisma_1.prisma.contactMessage.findUnique({
                where: { id },
            });
            if (!message) {
                return {
                    success: false,
                    message: "Message not found",
                };
            }
            await prisma_1.prisma.contactMessage.delete({
                where: { id },
            });
            return {
                success: true,
                message: "Message deleted successfully",
            };
        }
        catch (error) {
            logger_1.default.error("Delete contact message error:", error);
            throw error;
        }
    }
    async getContactStats() {
        try {
            const [totalMessages, unreadMessages, respondedMessages, archivedMessages, messagesToday, messagesThisWeek,] = await Promise.all([
                prisma_1.prisma.contactMessage.count(),
                prisma_1.prisma.contactMessage.count({
                    where: { status: client_1.ContactStatus.UNREAD },
                }),
                prisma_1.prisma.contactMessage.count({
                    where: { status: client_1.ContactStatus.RESPONDED },
                }),
                prisma_1.prisma.contactMessage.count({
                    where: { status: client_1.ContactStatus.ARCHIVED },
                }),
                prisma_1.prisma.contactMessage.count({
                    where: {
                        createdAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        },
                    },
                }),
                prisma_1.prisma.contactMessage.count({
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
        }
        catch (error) {
            logger_1.default.error("Get contact stats error:", error);
            throw error;
        }
    }
    async getFaqs(category) {
        try {
            const where = { isActive: true };
            if (category) {
                where.category = category;
            }
            const faqs = await prisma_1.prisma.fAQ.findMany({
                where,
                orderBy: { order: "asc" },
            });
            // Group by category
            const groupedFaqs = faqs.reduce((acc, faq) => {
                if (!acc[faq.category]) {
                    acc[faq.category] = [];
                }
                acc[faq.category].push(faq);
                return acc;
            }, {});
            return {
                success: true,
                message: "FAQs retrieved successfully",
                data: groupedFaqs,
            };
        }
        catch (error) {
            logger_1.default.error("Get FAQs error:", error);
            throw error;
        }
    }
    async createFaq(data) {
        try {
            const faq = await prisma_1.prisma.fAQ.create({
                data,
            });
            return {
                success: true,
                message: "FAQ created successfully",
                data: faq,
            };
        }
        catch (error) {
            logger_1.default.error("Create FAQ error:", error);
            throw error;
        }
    }
    async updateFaq(id, data) {
        try {
            const faq = await prisma_1.prisma.fAQ.findUnique({
                where: { id },
            });
            if (!faq) {
                return {
                    success: false,
                    message: "FAQ not found",
                };
            }
            const updatedFaq = await prisma_1.prisma.fAQ.update({
                where: { id },
                data,
            });
            return {
                success: true,
                message: "FAQ updated successfully",
                data: updatedFaq,
            };
        }
        catch (error) {
            logger_1.default.error("Update FAQ error:", error);
            throw error;
        }
    }
    async deleteFaq(id) {
        try {
            const faq = await prisma_1.prisma.fAQ.findUnique({
                where: { id },
            });
            if (!faq) {
                return {
                    success: false,
                    message: "FAQ not found",
                };
            }
            await prisma_1.prisma.fAQ.delete({
                where: { id },
            });
            return {
                success: true,
                message: "FAQ deleted successfully",
            };
        }
        catch (error) {
            logger_1.default.error("Delete FAQ error:", error);
            throw error;
        }
    }
}
exports.ContactService = ContactService;
//# sourceMappingURL=contact.service.js.map