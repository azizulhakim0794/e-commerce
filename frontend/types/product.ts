export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number | null;
    original_price?: number | null;
    badge?: string;
    category: string;
    specs?: string[];
    stock: number;
    image?: string | null;
    rating: number;
    reviews: number;
}

// export interface CartItem extends Product {
//     quantity: number;
// }

export interface CartItem {
  id: string;          // CartItem ID from backend
  product: Product;    // Product information
  quantity: number;    // How many the user wants
}