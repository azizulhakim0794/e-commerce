import type { ProductResponse } from "../../type/product";
import api from "../api";



export const getProduct = () => {
    return api.get<ProductResponse>("/product");
};