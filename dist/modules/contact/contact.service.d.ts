import { ApiResponse } from "../../shared/types";
import { CreateContactMessageInput, UpdateContactMessageInput, ContactQueryParams } from "./contact.interface";
export declare class ContactService {
    createMessage(data: CreateContactMessageInput): Promise<ApiResponse>;
    getMessages(params: ContactQueryParams): Promise<ApiResponse>;
    getMessageById(id: string): Promise<ApiResponse>;
    updateMessage(id: string, data: UpdateContactMessageInput): Promise<ApiResponse>;
    deleteMessage(id: string): Promise<ApiResponse>;
    getContactStats(): Promise<ApiResponse>;
    getFaqs(category?: string): Promise<ApiResponse>;
    createFaq(data: any): Promise<ApiResponse>;
    updateFaq(id: string, data: any): Promise<ApiResponse>;
    deleteFaq(id: string): Promise<ApiResponse>;
}
//# sourceMappingURL=contact.service.d.ts.map