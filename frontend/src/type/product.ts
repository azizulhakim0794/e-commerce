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
