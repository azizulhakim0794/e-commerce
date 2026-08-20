import { Link } from "react-router-dom";

const AboutPage = () => {
    return (
        <div className="bg-light min-vh-100">

            {/* =========================
                HERO SECTION
            ========================== */}
            <section className="bg-light">
                <div className="container py-5">
                    <div className="row align-items-center py-md-5">

                        <div className="col-lg-7">
                            <span className="badge bg-primary mb-3 px-3 py-2">
                                ABOUT OUR STORE
                            </span>

                            <h1 className="display-4 fw-bold mb-3">
                                Everything you need,
                                <br />
                                all in one place.
                            </h1>

                            <p className="lead mb-0">
                                We make online shopping simple, reliable,
                                and convenient by bringing quality products
                                directly to you.
                            </p>
                        </div>

                        <div className="col-lg-5 mt-4 mt-lg-0">
                            <div className="bg-white bg-opacity-10 rounded-4 p-4 p-md-5">

                                <div className="row text-center">

                                    <div className="col-4">
                                        <h3 className="fw-bold mb-1">
                                            1K+
                                        </h3>
                                        <small className="text-white-50">
                                            Products
                                        </small>
                                    </div>

                                    <div className="col-4">
                                        <h3 className="fw-bold mb-1">
                                            5K+
                                        </h3>
                                        <small className="text-white-50">
                                            Customers
                                        </small>
                                    </div>

                                    <div className="col-4">
                                        <h3 className="fw-bold mb-1">
                                            24/7
                                        </h3>
                                        <small className="text-white-50">
                                            Support
                                        </small>
                                    </div>

                                </div>

                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* =========================
                OUR STORY
            ========================== */}
            <section className="py-5">
                <div className="container py-md-4">

                    <div className="row align-items-center g-5">

                        <div className="col-lg-6">

                            <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">

                                <div className="display-5 mb-3">
                                    🛍️
                                </div>

                                <h2 className="fw-bold mb-3">
                                    Built for better shopping
                                </h2>

                                <p className="text-muted mb-0">
                                    Our goal is to create a shopping
                                    experience that is simple from
                                    beginning to end. From discovering
                                    products to placing an order, we want
                                    every step to feel straightforward and
                                    reliable.
                                </p>

                            </div>

                        </div>

                        <div className="col-lg-6">

                            <span className="text-primary fw-semibold">
                                OUR STORY
                            </span>

                            <h2 className="fw-bold mt-2 mb-3">
                                Shopping should be simple.
                            </h2>

                            <p className="text-muted">
                                We created this store with one simple
                                idea: online shopping shouldn't be
                                complicated.
                            </p>

                            <p className="text-muted">
                                Customers should be able to find what
                                they're looking for, add products to their
                                cart, securely place an order, and easily
                                track their purchases.
                            </p>

                            <p className="text-muted mb-0">
                                That's why we're continuously improving our
                                platform to make your shopping experience
                                faster and easier.
                            </p>

                        </div>

                    </div>

                </div>
            </section>

            {/* =========================
                OUR VALUES
            ========================== */}
            <section className="bg-white py-5">
                <div className="container py-md-4">

                    <div className="text-center mb-5">

                        <span className="text-primary fw-semibold">
                            WHAT WE VALUE
                        </span>

                        <h2 className="fw-bold mt-2">
                            Why shop with us?
                        </h2>

                        <p className="text-muted mx-auto mb-0"
                            style={{ maxWidth: "600px" }}
                        >
                            We focus on the things that matter most to
                            customers when shopping online.
                        </p>

                    </div>

                    <div className="row g-4">

                        {/* Quality */}
                        <div className="col-md-4">

                            <div className="card h-100 border-0 shadow-sm rounded-4">

                                <div className="card-body p-4">

                                    <div
                                        className="bg-primary bg-opacity-10 text-primary rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                        }}
                                    >
                                        ⭐
                                    </div>

                                    <h5 className="fw-bold">
                                        Quality Products
                                    </h5>

                                    <p className="text-muted mb-0">
                                        We aim to offer products that
                                        provide great value and meet our
                                        customers' expectations.
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* Fast Delivery */}
                        <div className="col-md-4">

                            <div className="card h-100 border-0 shadow-sm rounded-4">

                                <div className="card-body p-4">

                                    <div
                                        className="bg-success bg-opacity-10 text-success rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                        }}
                                    >
                                        🚚
                                    </div>

                                    <h5 className="fw-bold">
                                        Fast Delivery
                                    </h5>

                                    <p className="text-muted mb-0">
                                        We work to make sure your orders
                                        are processed efficiently and
                                        reach you as quickly as possible.
                                    </p>

                                </div>

                            </div>

                        </div>

                        {/* Secure Shopping */}
                        <div className="col-md-4">

                            <div className="card h-100 border-0 shadow-sm rounded-4">

                                <div className="card-body p-4">

                                    <div
                                        className="bg-warning bg-opacity-10 text-warning rounded-3 d-inline-flex align-items-center justify-content-center mb-3"
                                        style={{
                                            width: "50px",
                                            height: "50px",
                                        }}
                                    >
                                        🔒
                                    </div>

                                    <h5 className="fw-bold">
                                        Secure Shopping
                                    </h5>

                                    <p className="text-muted mb-0">
                                        Your account and order information
                                        are handled with security and
                                        privacy in mind.
                                    </p>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>
            </section>

            {/* =========================
                HOW IT WORKS
            ========================== */}
            <section className="py-5">
                <div className="container py-md-4">

                    <div className="text-center mb-5">

                        <span className="text-primary fw-semibold">
                            HOW IT WORKS
                        </span>

                        <h2 className="fw-bold mt-2">
                            Shopping made easy
                        </h2>

                    </div>

                    <div className="row g-4">

                        <div className="col-md-4">
                            <div className="text-center">

                                <div
                                    className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                                    style={{
                                        width: "55px",
                                        height: "55px",
                                    }}
                                >
                                    1
                                </div>

                                <h5 className="fw-bold">
                                    Find a product
                                </h5>

                                <p className="text-muted">
                                    Browse our products and find something
                                    you love.
                                </p>

                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="text-center">

                                <div
                                    className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                                    style={{
                                        width: "55px",
                                        height: "55px",
                                    }}
                                >
                                    2
                                </div>

                                <h5 className="fw-bold">
                                    Place your order
                                </h5>

                                <p className="text-muted">
                                    Add products to your cart or use
                                    Buy Now to checkout directly.
                                </p>

                            </div>
                        </div>

                        <div className="col-md-4">
                            <div className="text-center">

                                <div
                                    className="bg-dark text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                                    style={{
                                        width: "55px",
                                        height: "55px",
                                    }}
                                >
                                    3
                                </div>

                                <h5 className="fw-bold">
                                    Receive your order
                                </h5>

                                <p className="text-muted">
                                    Track your order and receive your
                                    products at your delivery address.
                                </p>

                            </div>
                        </div>

                    </div>

                </div>
            </section>

            {/* =========================
                CTA
            ========================== */}
            <section className="pb-5">
                <div className="container">

                    <div className="bg-primary text-white rounded-4 p-4 p-md-5">

                        <div className="row align-items-center">

                            <div className="col-lg-8">

                                <h2 className="fw-bold">
                                    Ready to start shopping?
                                </h2>

                                <p className="mb-0 text-white-50">
                                    Explore our products and find
                                    something you'll love.
                                </p>

                            </div>

                            <div className="col-lg-4 text-lg-end mt-4 mt-lg-0">

                                <Link
                                    to="/"
                                    className="btn btn-light px-4 py-2 fw-semibold"
                                >
                                    Shop Now
                                </Link>

                            </div>

                        </div>

                    </div>

                </div>
            </section>

        </div>
    );
};

export default AboutPage;