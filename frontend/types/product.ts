export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    badge:string;
    category:string;
    specs:string[]
    stock: number;
    image: string;
    rating: number;
    reviews: number
    
}

export interface ProductResponse {
    products: Product[];
}