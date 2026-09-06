export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    image: string;
    category: string;
    rating: number;
    reviews: number;
    stock: number;
    badge?: string;
    specs: string[];
}

export interface CartItem extends Product {
    quantity: number;
}

export interface User {
    name: string;
    email: string;
}