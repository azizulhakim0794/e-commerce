import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";

const MainLayout = () => {
    return (
        <>
            <Navbar />

            <main className="container mt-4">
                <Outlet />
            </main>
        </>
    );
};

export default MainLayout;