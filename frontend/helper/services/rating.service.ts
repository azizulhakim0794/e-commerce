import api from "../api";
import { Rating, RatingInput } from "@/types";

export const ratingService = {
    getByProductId: async (productId: string): Promise<Rating[]> => {
        const { data } = await api.get<Rating[]>(`/rating/${productId}`);
        return data;
    },

    create: async (data: RatingInput): Promise<Rating> => {
        const formData = new FormData();
        formData.append("product_id", data.product_id);
        formData.append("rating", String(data.rating));
        formData.append("comment", data.comment);
        if (data.photo) formData.append("photo", data.photo);
        const { data: responseData } = await api.post<Rating>("/rating", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return responseData;
    },

    update: async (
        data: { id: string } & Omit<RatingInput, "product_id">,
    ): Promise<Rating> => {
        const { id, ...payload } = data;
        const formData = new FormData();
        formData.append("rating", String(payload.rating));
        formData.append("comment", payload.comment);
        if (payload.photo) formData.append("photo", payload.photo);
        const { data: responseData } = await api.patch<Rating>(`/rating/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return responseData;
    },
};