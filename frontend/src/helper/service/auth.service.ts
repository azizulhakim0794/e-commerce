// import api from "./../";

import api from "../api";

export const loginApi = (data: {
    username: string;
    password: string;
}) => {
    return api.post("/auth/login/", data);
};

export const registerApi = (data: {
    username: string;
    email: string;
    password: string;
    confirmation: string;
}) => {
    return api.post("/auth/register/", data);
};

export const logoutApi = () => {
    return api.post("/auth/logout/");
};