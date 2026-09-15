import type { Product } from "./product";

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

export interface OrderResponse {
  id: string;
  order_items: OrderItem[];
  created_at: string | null;
  delivery_at: string | null;
  status: "processing" | "delivered";
}

export interface CreateOrderPayload {
  address_id: string;
}

export interface CreateBuyNowPayload {
  product_id: string;
  quantity: number;
  address_id: string;
}
