import { ContactStatus } from "@prisma/client";

export interface CreateContactMessageInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface UpdateContactMessageInput {
  status?: ContactStatus;
  response?: string;
}

export interface ContactQueryParams {
  page?: number;
  limit?: number;
  status?: ContactStatus;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}