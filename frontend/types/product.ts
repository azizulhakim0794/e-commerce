import { User } from "./auth";

export interface Product extends CreateProductType {
  id: string;
  originalPrice?: number | null;
  original_price?: number | null;
  rating: number;
  reviews: number;
}

export interface CreateProductType {
  name: string;
  description: string;
  price: number;
  original_price?: number | null;
  badge?: string;
  category: string;
  specs: string[];
  stock: number;
  image?: string | null;
}

export interface CartItem {
  id: string;
  product: Product;
  quantity: number;
}

export interface CartResponse {
  id: string;
  user_id: string;
  items: CartItem[];
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  product: Product;
}

export interface Order {
  user_detials: User;
  order_items: OrderItem[];
  created_at: string;
  delivery_at: string;
  status: string;
}
