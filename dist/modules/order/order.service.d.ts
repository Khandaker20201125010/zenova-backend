import { ApiResponse } from "../../shared/types";
export declare class OrderService {
    createOrder(userId: string, data: CreateOrderInput): Promise<ApiResponse>;
    getOrders(params: OrderQueryParams, userId?: string): Promise<ApiResponse>;
    getOrderById(id: string, userId?: string): Promise<ApiResponse>;
    getOrderByNumber(orderNumber: string, userId?: string): Promise<ApiResponse>;
    updateOrderStatus(id: string, data: UpdateOrderStatusInput): Promise<ApiResponse>;
    cancelOrder(id: string, userId: string): Promise<ApiResponse>;
    createCheckoutSession(orderId: string): Promise<ApiResponse>;
    handleStripeWebhook(payload: any, signature: string): Promise<ApiResponse>;
    getOrderStats(userId?: string): Promise<ApiResponse>;
    getUserOrders(userId: string, page?: number, limit?: number): Promise<ApiResponse>;
}
//# sourceMappingURL=order.service.d.ts.map