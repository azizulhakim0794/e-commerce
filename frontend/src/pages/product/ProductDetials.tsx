import { Link, useNavigate, useParams } from "react-router-dom";
// import { products } from "../../data/product";
import ProductCard from "./ProductCard";
import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import type { Product } from "../../type/product";
import { addToCart, getProduct } from "../../helper/service/product.service";
import OrderConfirmModal from "../modals/OrderConfirmModal";
import { useAuthStore } from "../../stores/auth.store";
import Loading from "../../components/loading";
// import { getProductById } from "../../helper/service/product.service";


const ProductDetails = () => {
    const { id } = useParams();

    const [products, setProducts] = useState<Product[]>([]);
    const [product, setProduct] = useState<Product>();
    const [cartCount, setCartCount] = useState<number>(1);
    const [showOrderModal, setShowOrderModal] = useState<boolean>(false)
    const { user } = useAuthStore();
    const navigate = useNavigate();

    const {
        handleRequest,
        isLoading,
    } = useApi();

    const fetchProducts = async () => {
        const result = await handleRequest(
            getProduct,
            {}
        );

        if (result.success && result.data) {
            setProducts(result.data.products);
        }
    };

    useEffect(() => {

        fetchProducts();
    }, []);


    // Find the product after products are loaded
    useEffect(() => {
        if (id && products.length > 0) {
            const foundProduct = products.find(
                (product) => product.id.toString() === id
            );
            setCartCount(1)
            setProduct(foundProduct);
        }
    }, [id, products]);

    if (isLoading)
        return <><Loading /></>


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


    // cart item oparations 
    const addProductIntoCart = async (product_id: number) => {

        console.log(product_id, cartCount)
        const result = await handleRequest(
            addToCart,
            {
                product_id: product_id,
                quantity: cartCount,
            }
        );

        if (result.success) {
            // go to the /cart page
            navigate("/cart");

            // next step
        }

    }

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
                                        disabled={cartCount <= 1}
                                        onClick={() => setCartCount((prev) => Math.max(1, prev - 1))}
                                    >
                                        −
                                    </button>

                                    <input
                                        type="number"
                                        className="form-control text-center"
                                        value={cartCount}
                                        min={1}
                                        max={product.stock}
                                        readOnly
                                    />

                                    <button
                                        className="btn btn-outline-secondary"
                                        type="button"
                                        disabled={cartCount >= product.stock}
                                        onClick={() =>
                                            setCartCount((prev) => Math.min(product.stock, prev + 1))
                                        }
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
                                onClick={() => user ? addProductIntoCart(product.id) : navigate("/register")}
                            >
                                🛒 Add to Cart
                            </button>

                            <button
                                className="btn btn-success btn-lg"
                                disabled={isOutOfStock}
                                onClick={() => user ? setShowOrderModal(true) : navigate("/register")}
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

                        {/* checkout modals start */}
                        <OrderConfirmModal
                            show={showOrderModal}
                            onClose={() => setShowOrderModal(false)}
                            // onConfirm={handlePlaceOrder}
                            orderdProduct={{ quantity: cartCount, product_id: product.id }}
                            total_price={Number((cartCount * product.price).toFixed(2))}
                        />
                        {/* checkout modals end */}
                    </div>
                </div>
            </section >

            {/* =========================
          Description
      ========================== */}
            < section className="border-top pt-5 mb-5" >
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
            </section >

            {/* =========================
          Related Products
      ========================== */}
            < section className="mb-5" >
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
                        to="/"
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
            </section >
        </>
    );
};

export default ProductDetails;