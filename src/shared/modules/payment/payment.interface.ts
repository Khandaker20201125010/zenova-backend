export interface CreatePaymentInput {
  amount: number;
  currency?: string;
  description?: string;
  orderId?: string;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  userId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}