import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";
import Loading from "../components/loading";

export default function ProtectedRoute() {
    const { user, loading } = useAuthStore();

    if (loading) {
        return <><Loading /></>
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}