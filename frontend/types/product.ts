export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    original_price: number | null;
    badge:string;
    category:string;
    specs:string[]
    stock: number;
    image: string;
    rating: number;
    reviews: number
    
}

export interface CartItem extends Product {
    quantity: number;
}