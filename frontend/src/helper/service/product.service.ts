import api from "../api";



export const getProduct = () => {
    return api.get("/products");
};

export const getProductById = (id: string) => {
    return api.get("/product/" + id);
};

// all cart related items

export const addToCart = (data: { product_id: number; quantity: number }) => {
    return api.post("/cart", data);
};

export const getCartItems = () => {
    return api.get("/cart");
};

export const deleteProductFromCart = (product_id: number) => {
    return api.delete("/cart/" + product_id);
};