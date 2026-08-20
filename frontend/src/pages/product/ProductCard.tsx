import { useNavigate } from "react-router-dom";
import type { Product } from "../../type/product";
// import type { Product } from "../types/product";

interface ProductCardProps {
    product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
    const isOutOfStock = product.stock === 0;
    const isLowStock = product.stock > 0 && product.stock <= 5;

    const navigate = useNavigate();

    return (
        <div className="col cursor-pointer" onClick={() => navigate(`/products/${product.id}`)}>
            <div className="card h-100 shadow-sm">
                <img
                    src={product.image}
                    className="card-img-top"
                    alt={product.name}
                />

                <div className="card-body d-flex flex-column">
                    <h5 className="card-title">{product.name}</h5>

                    <p className="card-text text-muted">
                        {product.description}
                    </p>

                    <div className="mb-3">
                        <h5 className="mb-2">${product.price.toFixed(2)}</h5>

                        {isOutOfStock ? (
                            <span className="badge text-bg-danger">
                                Out of Stock
                            </span>
                        ) : isLowStock ? (
                            <span className="badge text-bg-warning">
                                Only {product.stock} left
                            </span>
                        ) : (
                            <span className="badge text-bg-success">
                                In Stock ({product.stock})
                            </span>
                        )}
                    </div>

                    {/* <div className="mt-auto d-flex gap-2">
                        <Link
                            to={`/products/${product.id}`}
                            className="btn btn-outline-primary w-100"
                        >
                            Details
                        </Link>

                        <button
                            className="btn btn-primary w-100"
                            disabled={isOutOfStock}
                        >
                            Add to Cart
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default ProductCard;