import type { Product, ProductResponse } from "../../type/product";
import api from "../api";



export const getProduct = () => {
    return api.get("/products");
};

export const getProductById = (id: string) => {
    return api.get("/product/" + id);
};