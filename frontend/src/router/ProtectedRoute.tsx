import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
// import { useAuthStore } from "../stores/auth.store";

export default function ProtectedRoute() {
    const { user, loading } = useAuthStore();

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}