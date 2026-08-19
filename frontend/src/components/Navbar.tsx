import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/auth.store";

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <nav className="navbar navbar-expand-lg bg-body-tertiary">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    MyShop
                </Link>

                <button
                    className="navbar-toggler"
                    type="button"
                    data-bs-toggle="collapse"
                    data-bs-target="#navbarNav"
                    aria-controls="navbarNav"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <li className="nav-item">
                            <Link className="nav-link" to="/">
                                Home
                            </Link>
                        </li>


                        {user ? <>
                            <li className="nav-item">
                                <Link className="nav-link" to="/cart">
                                    Cart
                                </Link>
                            </li>

                            <li className="nav-item">
                                <Link className="nav-link" to="/orders">
                                    Orders
                                </Link>
                            </li>
                        </> : <></>}
                    </ul>

                    <div className="d-flex align-items-center gap-2">
                        {user ? (
                            <>
                                <span className="text-muted small">
                                    Hi, {user.username}
                                </span>
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={handleLogout}
                                >
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <Link className="btn btn-outline-primary" to="/login">
                                    Login
                                </Link>
                                <Link className="btn btn-primary" to="/register">
                                    Register
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
