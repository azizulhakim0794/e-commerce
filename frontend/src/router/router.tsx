import { createBrowserRouter } from "react-router-dom";

import Home from "../pages/home/Home";
import Login from "../pages/authentication/Login";
import ProductDetails from "../pages/product/ProductDetials";
// import ProductCard from "../pages/product/ProductCard";
import ProductCheckout from "../pages/product/ProductCheckout";
import ProductOrder from "../pages/product/ProductOrder";
import Register from "../pages/authentication/Register";
import MainLayout from "../layout/MainLayout";
import ProtectedRoute from "./ProtectedRoute";
import Cart from "../pages/cart/Cart";


const router = createBrowserRouter([
    {
        element: <MainLayout />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/register",
                element: <Register />,
            },
            {
                path: "/products/:id",
                element: <ProductDetails />,
            },

            // Protected routes
            {
                element: <ProtectedRoute />,
                children: [
                    {
                        path: "/cart",
                        element: <Cart />,
                    },
                    {
                        path: "/checkout",
                        element: <ProductCheckout />,
                    },
                    {
                        path: "/orders",
                        element: <ProductOrder />,
                    },
                ],
            },
        ]
    }

]);

export default router;