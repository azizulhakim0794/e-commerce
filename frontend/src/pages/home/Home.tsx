import { Link } from "react-router-dom";
import type { Product } from "../../type/product";
import { products } from "../../data/product";
import ProductCard from "../product/ProductCard";

const Home = () => {



    return (
        <>
            {/* =========================
          Hero Section
      ========================== */}
            <section className="bg-light py-5 rounded-3 mb-5">
                <div className="container py-4">
                    <div className="row align-items-center">
                        <div className="col-lg-7">
                            <span className="badge text-bg-primary mb-3">
                                Welcome to MyShop
                            </span>

                            <h1 className="display-4 fw-bold mb-3">
                                Everything You Need,
                                <br />
                                All in One Place.
                            </h1>

                            <p className="lead text-muted mb-4">
                                Discover quality products at affordable prices.
                                Shop your favorite products and get them delivered
                                right to your door.
                            </p>

                            <div className="d-flex gap-3">
                                {/* <Link
                                    to="/products"
                                    className="btn btn-primary btn-lg"
                                >
                                    Browse Products
                                </Link> */}

                                <Link
                                    to="/register"
                                    className="btn btn-primary btn-lg"
                                >
                                    Create Account
                                </Link>
                            </div>
                        </div>

                        <div className="col-lg-5 mt-4 mt-lg-0">
                            <div className="bg-white rounded-3 shadow-sm p-5 text-center">
                                <div className="display-1 mb-3">🛍️</div>

                                <h3 className="fw-bold">
                                    Shop With Confidence
                                </h3>

                                <p className="text-muted mb-0">
                                    Quality products, great prices, and easy
                                    shopping.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================
          Featured Products
      ========================== */}
            <section className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">
                            Featured Products
                        </h2>

                        <p className="text-muted mb-0">
                            Check out some of our popular products.
                        </p>
                    </div>
                    {/* 
                    <Link
                        to="/products"
                        className="btn btn-outline-primary"
                    >
                        View All
                    </Link> */}
                </div>

                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                        />
                    ))}
                </div>
            </section>

            {/* =========================
          Why Choose Us
      ========================== */}
            <section className="bg-light rounded-3 py-5 mb-5">
                <div className="container">
                    <div className="text-center mb-5">
                        <h2 className="fw-bold">
                            Why Choose MyShop?
                        </h2>

                        <p className="text-muted">
                            We make online shopping simple and convenient.
                        </p>
                    </div>

                    <div className="row text-center g-4">
                        {/* Fast Delivery */}
                        <div className="col-md-6 col-lg-3">
                            <div className="bg-white rounded-3 p-4 h-100 shadow-sm">
                                <div className="display-5 mb-3">
                                    🚚
                                </div>

                                <h5 className="fw-bold">
                                    Fast Delivery
                                </h5>

                                <p className="text-muted mb-0">
                                    Get your products delivered quickly
                                    and safely.
                                </p>
                            </div>
                        </div>

                        {/* Secure Payment */}
                        <div className="col-md-6 col-lg-3">
                            <div className="bg-white rounded-3 p-4 h-100 shadow-sm">
                                <div className="display-5 mb-3">
                                    🔒
                                </div>

                                <h5 className="fw-bold">
                                    Secure Payment
                                </h5>

                                <p className="text-muted mb-0">
                                    Your payment information is kept
                                    safe and secure.
                                </p>
                            </div>
                        </div>

                        {/* Quality Products */}
                        <div className="col-md-6 col-lg-3">
                            <div className="bg-white rounded-3 p-4 h-100 shadow-sm">
                                <div className="display-5 mb-3">
                                    ⭐
                                </div>

                                <h5 className="fw-bold">
                                    Quality Products
                                </h5>

                                <p className="text-muted mb-0">
                                    We offer carefully selected quality
                                    products.
                                </p>
                            </div>
                        </div>

                        {/* Easy Returns */}
                        <div className="col-md-6 col-lg-3">
                            <div className="bg-white rounded-3 p-4 h-100 shadow-sm">
                                <div className="display-5 mb-3">
                                    ↩️
                                </div>

                                <h5 className="fw-bold">
                                    Easy Returns
                                </h5>

                                <p className="text-muted mb-0">
                                    Simple and convenient return process.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================
          Call To Action
      ========================== */}
            <section className="bg-primary text-white rounded-3 p-5 mb-5 text-center">
                <h2 className="fw-bold mb-3">
                    Ready to Start Shopping?
                </h2>

                <p className="lead mb-4">
                    Explore our products and find something you'll love.
                </p>

                <Link
                    to="/products"
                    className="btn btn-light btn-lg"
                >
                    Start Shopping
                </Link>
            </section>

            {/* =========================
          Footer
      ========================== */}
            <footer className="border-top pt-5 pb-4">
                <div className="row">
                    {/* Brand */}
                    <div className="col-md-5 mb-4">
                        <h4 className="fw-bold">
                            MyShop
                        </h4>

                        <p className="text-muted">
                            Your simple and reliable online shopping
                            experience.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="col-md-3 mb-4">
                        <h6 className="fw-bold">
                            Quick Links
                        </h6>

                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <Link
                                    to="/"
                                    className="text-decoration-none text-muted"
                                >
                                    Home
                                </Link>
                            </li>

                            <li className="mb-2">
                                <Link
                                    to="/products"
                                    className="text-decoration-none text-muted"
                                >
                                    Products
                                </Link>
                            </li>

                            <li className="mb-2">
                                <Link
                                    to="/cart"
                                    className="text-decoration-none text-muted"
                                >
                                    Cart
                                </Link>
                            </li>

                            <li>
                                <Link
                                    to="/orders"
                                    className="text-decoration-none text-muted"
                                >
                                    Orders
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Account */}
                    <div className="col-md-4 mb-4">
                        <h6 className="fw-bold">
                            Account
                        </h6>

                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <Link
                                    to="/login"
                                    className="text-decoration-none text-muted"
                                >
                                    Login
                                </Link>
                            </li>

                            <li className="mb-2">
                                <Link
                                    to="/register"
                                    className="text-decoration-none text-muted"
                                >
                                    Register
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <hr />

                <div className="text-center text-muted">
                    <small>
                        © 2026 MyShop. All rights reserved.
                    </small>
                </div>
            </footer>
        </>
    );
}

export default Home;