import { PaymentStatus } from '@prisma/client'; // Import the enum

export interface CreatePaymentInput {
  amount: number;
  currency?: string;
  description?: string;
  orderId?: string;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  search?: string; 
  status?: PaymentStatus | string; // Use enum type
  startDate?: string;
  endDate?: string;
  userId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}