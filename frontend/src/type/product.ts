export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock: number;
    image: string;
}

export interface ProductResponse {
    products: Product[];
}

export interface CartItem {
    id: number;
    product: {
        id: number;
        name: string;
        price: number;
        image: string;
    };
    quantity: number;
    subtotal: number;
}

export interface CartType {
    items: CartItem[];
    item_count: number;
    total_quantity: number;
    subtotal: number;
}