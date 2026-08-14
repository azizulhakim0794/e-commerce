import { Link, useParams } from "react-router-dom";
import { products } from "../../data/product";
import ProductCard from "./ProductCard";
// import { products } from "../data/products";
// import ProductCard from "../components/ProductCard";

const ProductDetails = () => {
    const { id } = useParams();

    const product = products.find(
        (product) => product.id === Number(id)
    );

    // Product doesn't exist
    if (!product) {
        return (
            <div className="text-center py-5">
                <h2>Product Not Found</h2>

                <p className="text-muted">
                    The product you're looking for doesn't exist.
                </p>

                <Link
                    to="/products"
                    className="btn btn-primary"
                >
                    Back to Products
                </Link>
            </div>
        );
    }

    const isOutOfStock = product.stock === 0;
    const isLowStock =
        product.stock > 0 && product.stock <= 5;

    return (
        <>
            {/* =========================
          Breadcrumb
      ========================== */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item">
                        <Link
                            to="/"
                            className="text-decoration-none"
                        >
                            Home
                        </Link>
                    </li>

                    <li className="breadcrumb-item">
                        <Link
                            to="/"
                            className="text-decoration-none"
                        >
                            Products
                        </Link>
                    </li>

                    <li
                        className="breadcrumb-item active"
                        aria-current="page"
                    >
                        {product.name}
                    </li>
                </ol>
            </nav>

            {/* =========================
          Product Details
      ========================== */}
            <section className="mb-5">
                <div className="row g-5">
                    {/* Product Image */}
                    <div className="col-lg-6">
                        <div className="bg-light rounded-3 p-4 text-center">
                            <img
                                src={product.image}
                                alt={product.name}
                                className="img-fluid rounded"
                            />
                        </div>
                    </div>

                    {/* Product Information */}
                    <div className="col-lg-6">
                        <h1 className="fw-bold mb-3">
                            {product.name}
                        </h1>

                        {/* Rating */}
                        <div className="mb-3">
                            <span className="text-warning fs-5">
                                ★★★★★
                            </span>

                            <span className="text-muted ms-2">
                                4.8 (24 reviews)
                            </span>
                        </div>

                        {/* Price */}
                        <h2 className="fw-bold mb-4">
                            ${product.price.toFixed(2)}
                        </h2>

                        {/* Description */}
                        <p className="text-muted fs-5 mb-4">
                            {product.description}
                        </p>

                        <hr />

                        {/* Stock */}
                        <div className="my-4">
                            {isOutOfStock ? (
                                <span className="badge text-bg-danger fs-6">
                                    Out of Stock
                                </span>
                            ) : isLowStock ? (
                                <span className="badge text-bg-warning fs-6">
                                    Only {product.stock} left
                                </span>
                            ) : (
                                <span className="badge text-bg-success fs-6">
                                    In Stock ({product.stock} available)
                                </span>
                            )}
                        </div>

                        {/* Quantity */}
                        {!isOutOfStock && (
                            <div className="mb-4">
                                <label className="form-label fw-semibold">
                                    Quantity
                                </label>

                                <div
                                    className="input-group"
                                    style={{ maxWidth: "180px" }}
                                >
                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                    >
                                        −
                                    </button>

                                    <input
                                        type="number"
                                        className="form-control text-center"
                                        value="1"
                                        min="1"
                                        max={product.stock}
                                        readOnly
                                    />

                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="d-flex gap-3">
                            <button
                                className="btn btn-primary btn-lg"
                                disabled={isOutOfStock}
                            >
                                🛒 Add to Cart
                            </button>

                            <button
                                className="btn btn-success btn-lg"
                                disabled={isOutOfStock}
                            >
                                Buy Now
                            </button>
                        </div>

                        {/* Product Benefits */}
                        <div className="mt-5">
                            <div className="row g-3">
                                <div className="col-6">
                                    <div className="border rounded p-3">
                                        <strong>🚚 Fast Delivery</strong>
                                        <small className="d-block text-muted mt-1">
                                            Quick and safe delivery
                                        </small>
                                    </div>
                                </div>

                                <div className="col-6">
                                    <div className="border rounded p-3">
                                        <strong>↩️ Easy Returns</strong>
                                        <small className="d-block text-muted mt-1">
                                            Simple return process
                                        </small>
                                    </div>
                                </div>

                                <div className="col-6">
                                    <div className="border rounded p-3">
                                        <strong>🔒 Secure Payment</strong>
                                        <small className="d-block text-muted mt-1">
                                            Your payment is secure
                                        </small>
                                    </div>
                                </div>

                                <div className="col-6">
                                    <div className="border rounded p-3">
                                        <strong>⭐ Quality Product</strong>
                                        <small className="d-block text-muted mt-1">
                                            Carefully selected products
                                        </small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* =========================
          Description
      ========================== */}
            <section className="border-top pt-5 mb-5">
                <h2 className="fw-bold mb-4">
                    Product Description
                </h2>

                <p className="text-muted">
                    {product.description}
                </p>

                <p className="text-muted">
                    This product is designed to provide a reliable
                    and enjoyable experience. We carefully select
                    our products to provide quality and value to
                    our customers.
                </p>
            </section>

            {/* =========================
          Related Products
      ========================== */}
            <section className="mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">
                            You May Also Like
                        </h2>

                        <p className="text-muted mb-0">
                            Other products you might be interested in.
                        </p>
                    </div>

                    <Link
                        to="/products"
                        className="btn btn-outline-primary"
                    >
                        View All
                    </Link>
                </div>

                <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
                    {products
                        .filter((item) => item.id !== product.id)
                        .slice(0, 4)
                        .map((item) => (
                            <ProductCard
                                key={item.id}
                                product={item}
                            />
                        ))}
                </div>
            </section>
        </>
    );
};

export default ProductDetails;