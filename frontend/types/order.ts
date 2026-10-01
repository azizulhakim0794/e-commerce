import type { Product } from "./product";
import type { User } from "./auth";

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

/** Matches backend OrderedProductResponse */
export interface AdminOrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: string;
  created_at: string;
  user_details: User;
}

/** Matches backend AllOrderResponse */
export interface AllOrderResponse {
  order_items: AdminOrderItem[];
  created_at: string;
  delivery_at: string;
  status: "processing" | "delivered";
}
