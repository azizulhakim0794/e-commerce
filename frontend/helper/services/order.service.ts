import api from "../api";
import type {
  CreateBuyNowPayload,
  CreateOrderPayload,
  OrderResponse,
} from "@/types/order";

export const orderService = {
  getOrders: async (): Promise<OrderResponse[]> => {
    const { data } = await api.get<OrderResponse[]>("/orders");
    return data;
  },

  createOrderFromCart: async (
    payload: CreateOrderPayload,
  ): Promise<OrderResponse> => {
    const { data } = await api.post<OrderResponse>("/orders", payload);
    return data;
  },

  createOrderBuyNow: async (
    payload: CreateBuyNowPayload,
  ): Promise<OrderResponse> => {
    const { data } = await api.post<OrderResponse>("/orders/buy-now", payload);
    return data;
  },
};
