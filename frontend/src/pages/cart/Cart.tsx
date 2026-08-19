import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { deleteProductFromCart, getCartItems } from "../../helper/service/product.service";
import type { Cart } from "../../type/product";
import OrderConfirmModal from "../modals/OrderConfirmModal";

const Cart = () => {

    interface orderedProductType {
        cart_id?: number,
        product_id: number,
        quantity?: number,
    }

    const [cart, setCart] = useState<Cart>();
    const [showOrderModal, setShowOrderModal] = useState<boolean>(false);
    const [orderdProduct, setOrderdProduct] = useState<orderedProductType[]>();

    const {
        handleRequest,
        isLoading,
        error,
    } = useApi();

    const fetchProducts = async () => {
        const result = await handleRequest(
            getCartItems,
            {}
        );

        if (result.success && result.data) {

            const orderedProducts = result.data.cart.items.map((item: any) => ({
                cart_id: item.id,
                product_id: item.product.id,
                quantity: item.quantity
            }));

            setOrderdProduct(orderedProducts)
            setCart(result.data.cart)
        }
    };

    useEffect(() => {
        if (!showOrderModal) {
            fetchProducts();
        }

    }, [showOrderModal]);

    if (isLoading)
        return <>Loading....</>


    const removeProductFromCart = async (product_id: number) => {

        const result = await handleRequest(
            deleteProductFromCart, product_id
        );

        if (result.success) {
            // next step
            fetchProducts();
        }


    }



    return (
        <div className="container py-5">

            <div className={`row g-4 ${((cart && cart.items.length == 0) || cart == null) ? 'justify-content-center mt-4' : ''}`}>

                {/* ================= CART ITEMS ================= */}
                <div className="col-lg-8">

                    {cart && cart.items.length > 0 ? <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="fw-bold mb-1">Shopping Cart</h2>
                            <p className="text-muted mb-0">
                                {cart?.item_count ?? 0} item(s) in your cart
                            </p>
                        </div>
                    </div> : <></>}

                    {cart && cart.items.length > 0 ? (
                        cart.items.map((item) => (
                            <div
                                key={item.id}
                                className="card border-0 shadow-sm mb-3"
                            >
                                <div className="card-body p-3 p-md-4">

                                    <div className="row align-items-center g-3">

                                        {/* Product Image */}
                                        <div className="col-4 col-md-2">
                                            <img
                                                src={item.product.image}
                                                alt={item.product.name}
                                                className="img-fluid rounded"
                                                style={{
                                                    width: "100%",
                                                    aspectRatio: "1 / 1",
                                                    objectFit: "cover",
                                                }}
                                            />
                                        </div>

                                        {/* Product Info */}
                                        <div className="col-8 col-md-4">
                                            <h5 className="fw-semibold mb-2">
                                                {item.product.name}
                                            </h5>

                                            <p className="text-muted mb-0">
                                                ${item.product.price.toFixed(2)} each
                                            </p>
                                        </div>

                                        {/* Quantity */}
                                        <div className="col-6 col-md-2">
                                            <small className="text-muted d-block mb-1">
                                                Quantity
                                            </small>

                                            <span className="badge bg-light text-dark border px-3 py-2">
                                                {item.quantity}
                                            </span>
                                        </div>

                                        {/* Subtotal */}
                                        <div className="col-6 col-md-2">
                                            <small className="text-muted d-block mb-1">
                                                Subtotal
                                            </small>

                                            <strong className="fs-6">
                                                ${item.subtotal.toFixed(2)}
                                            </strong>
                                        </div>

                                        {/* Remove */}
                                        <div className="col-12 col-md-2 text-md-end">
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => removeProductFromCart(item.product.id)}
                                            >
                                                Remove
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="card border-0 shadow-sm">
                            <div className="card-body text-center py-5">
                                <h4 className="fw-semibold">Your cart is empty</h4>
                                <p className="text-muted mb-0">
                                    Add some products to your cart to continue.
                                </p>
                            </div>
                        </div>
                    )}
                </div>


                {/* ================= CART SUMMARY ================= */}
                {cart && cart.items.length > 0 ? <div className="col-lg-4">

                    {cart && cart.items.length > 0 && (
                        <div
                            className="card border-0 shadow-sm sticky-lg-top"
                            style={{ top: "20px" }}
                        >
                            <div className="card-body p-4">

                                <h4 className="fw-bold mb-4">
                                    Cart Summary
                                </h4>

                                {/* Items */}
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted">
                                        Items
                                    </span>

                                    <span className="fw-semibold">
                                        {cart.item_count}
                                    </span>
                                </div>

                                {/* Quantity */}
                                <div className="d-flex justify-content-between mb-3">
                                    <span className="text-muted">
                                        Total Quantity
                                    </span>

                                    <span className="fw-semibold">
                                        {cart.total_quantity}
                                    </span>
                                </div>

                                <hr />

                                {/* Subtotal */}
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <span className="fs-5 fw-semibold">
                                        Total
                                    </span>

                                    <span className="fs-4 fw-bold">
                                        ${cart.subtotal.toFixed(2)}
                                    </span>
                                </div>

                                {/* Order Now */}
                                <button
                                    type="button"
                                    className="btn btn-primary btn-lg w-100 fw-semibold"
                                    onClick={() => setShowOrderModal(true)}
                                >
                                    Order Now
                                </button>

                                <p className="text-muted text-center small mt-3 mb-0">
                                    You can review your order before payment.
                                </p>

                            </div>
                        </div>
                    )}

                </div> : <></>}

            </div>

            {cart && <OrderConfirmModal
                show={showOrderModal}
                onClose={() => setShowOrderModal(false)}
                // onConfirm={handlePlaceOrder}
                // orderdProduct={orderdProduct}
                total_price={cart.subtotal}
            />}

        </div>
    );
}

export default Cart;