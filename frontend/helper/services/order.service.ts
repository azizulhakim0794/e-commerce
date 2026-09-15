import api from "../api";
import type {
  CreateBuyNowPayload,
  CreateOrderPayload,
  OrderResponse,
} from "@/types/order";

export const orderService = {
  getOrders: async (): Promise<OrderResponse[]> => {
    const response = await api.get<OrderResponse[]>("/orders");
    return response.data;
  },

  createOrderFromCart: async (
    payload: CreateOrderPayload,
  ): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse>("/orders", payload);
    return response.data;
  },

  createOrderBuyNow: async (
    payload: CreateBuyNowPayload,
  ): Promise<OrderResponse> => {
    const response = await api.post<OrderResponse>("/orders/buy-now", payload);
    return response.data;
  },
};
