import type { Product } from "../../type/product";
import api from "../api";

export const getProduct = () => {
    return api.get<Product>("api/product");
};