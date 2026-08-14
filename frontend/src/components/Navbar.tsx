import { Link } from "react-router-dom";

const Navbar = () => {
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
                    </ul>

                    <div className="d-flex gap-2">
                        <Link className="btn btn-outline-primary" to="/login">
                            Login
                        </Link>

                        <Link className="btn btn-primary" to="/register">
                            Register
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;