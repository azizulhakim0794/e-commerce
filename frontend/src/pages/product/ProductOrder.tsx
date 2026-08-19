import { useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";
import { getOrder } from "../../helper/service/product.service";

interface OrderItem {
    id: number;
    product_id: number;
    product_name: string;
    product_price: number;
    product_image: string;
    quantity: number;
    subtotal: number;
}

type OrderStatus =
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";

interface Order {
    id: number;
    full_name: string;
    phone_number: string;
    delivery_address: string;
    city: string;
    post_code: string;
    status: OrderStatus;
    subtotal: number;
    delivery_fee: number;
    total: number;
    created_at: string;
    updated_at: string;
    items: OrderItem[];
}

interface OrdersResponse {
    orders: Order[];
}

const ProductOrder = () => {

    const [orders, setOrders] = useState<Order[]>([]);
    const { handleRequest, isLoading } = useApi();

    const fetchProducts = async () => {
        const result = await handleRequest(
            getOrder,
            {}
        );

        if (result.success && result.data) {
            setOrders(result.data.orders);

        }
    };

    useEffect(() => {

        fetchProducts();
    }, []);

    if (isLoading)
        return <>Loading....</>


    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (date: string) => {
        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatStatus = (status: OrderStatus) => {
        return status.charAt(0).toUpperCase() + status.slice(1);
    };

    const getStatusClass = (status: OrderStatus) => {
        switch (status) {
            case "pending":
                return "bg-warning text-dark";

            case "confirmed":
                return "bg-primary";

            case "processing":
                return "bg-info text-dark";

            case "shipped":
                return "bg-secondary";

            case "delivered":
                return "bg-success";

            case "cancelled":
                return "bg-danger";

            default:
                return "bg-secondary";
        }
    };

    return (
        <div className="bg-light min-vh-100">
            <div className="container py-4 py-md-5">

                {/* =========================
                    PAGE HEADER
                ========================== */}
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">

                    <div>
                        <h1 className="fw-bold mb-1">
                            My Orders
                        </h1>

                        <p className="text-muted mb-0">
                            View your order history and track your
                            purchases.
                        </p>
                    </div>

                    <span className="badge bg-white text-dark border px-3 py-2 mt-3 mt-md-0">
                        {orders.length}{" "}
                        {orders.length === 1
                            ? "Order"
                            : "Orders"}
                    </span>

                </div>

                {/* =========================
                    EMPTY ORDERS
                ========================== */}
                {orders.length === 0 && (
                    <div className="card border-0 shadow-sm">
                        <div className="card-body text-center py-5">

                            <div className="display-5 mb-3">
                                📦
                            </div>

                            <h3 className="fw-bold">
                                No orders yet
                            </h3>

                            <p className="text-muted">
                                You haven't placed any orders yet.
                            </p>

                            <button
                                type="button"
                                className="btn btn-dark px-4"
                            >
                                Start Shopping
                            </button>

                        </div>
                    </div>
                )}

                {/* =========================
                    ORDERS
                ========================== */}
                <div className="d-flex flex-column gap-4">

                    {orders.map((order) => (
                        <div
                            className="card border-0 shadow-sm"
                            key={order.id}
                        >

                            {/* =========================
                                ORDER HEADER
                            ========================== */}
                            <div className="card-header bg-white p-3 p-md-4">

                                <div className="row align-items-center">

                                    <div className="col-md-8">

                                        <div className="d-flex align-items-center flex-wrap gap-2">

                                            <h5 className="fw-bold mb-0">
                                                Order #{order.id}
                                            </h5>

                                            <span
                                                className={`badge ${getStatusClass(
                                                    order.status
                                                )}`}
                                            >
                                                {formatStatus(
                                                    order.status
                                                )}
                                            </span>

                                        </div>

                                        <small className="text-muted">
                                            Placed on{" "}
                                            {formatDate(
                                                order.created_at
                                            )}{" "}
                                            at{" "}
                                            {formatTime(
                                                order.created_at
                                            )}
                                        </small>

                                    </div>

                                    <div className="col-md-4 text-md-end mt-3 mt-md-0">

                                        <small className="text-muted d-block">
                                            Order Total
                                        </small>

                                        <h5 className="fw-bold mb-0">
                                            $
                                            {order.total.toFixed(
                                                2
                                            )}
                                        </h5>

                                    </div>

                                </div>

                            </div>

                            {/* =========================
                                PRODUCTS
                            ========================== */}
                            <div className="card-body p-3 p-md-4">

                                <h6 className="fw-bold mb-3">
                                    Order Items
                                </h6>

                                <div className="d-flex flex-column">

                                    {order.items.map((item: any) => (
                                        <div
                                            key={item.id}
                                            className="row align-items-center g-3 py-3 border-bottom"
                                        >

                                            {/* Product Image */}
                                            <div className="col-3 col-sm-2 col-md-2 col-lg-1">

                                                <img
                                                    src={
                                                        item.product_image
                                                    }
                                                    alt={
                                                        item.product_name
                                                    }
                                                    className="img-fluid rounded border"
                                                    style={{
                                                        width: "80px",
                                                        height: "80px",
                                                        objectFit: "cover",
                                                    }}
                                                />

                                            </div>

                                            {/* Product Information */}
                                            <div className="col-9 col-sm-10 col-md-5 col-lg-5">

                                                <h6 className="fw-semibold mb-1">
                                                    {item.product_name}
                                                </h6>

                                                <small className="text-muted d-block mb-1">
                                                    Product ID:{" "}
                                                    {item.product_id}
                                                </small>

                                                <span className="text-muted small">
                                                    ${item.product_price.toFixed(
                                                        2
                                                    )}{" "}
                                                    ×{" "}
                                                    {item.quantity}
                                                </span>

                                            </div>

                                            {/* Price */}
                                            <div className="col-4 col-md-2">

                                                <small className="text-muted d-block">
                                                    Price
                                                </small>

                                                <span className="fw-semibold">
                                                    $
                                                    {item.product_price.toFixed(
                                                        2
                                                    )}
                                                </span>

                                            </div>

                                            {/* Quantity */}
                                            <div className="col-4 col-md-1">

                                                <small className="text-muted d-block">
                                                    Quantity
                                                </small>

                                                <span className="fw-semibold">
                                                    {item.quantity}
                                                </span>

                                            </div>

                                            {/* Subtotal */}
                                            <div className="col-4 col-md-2 text-md-end">

                                                <small className="text-muted d-block">
                                                    Subtotal
                                                </small>

                                                <span className="fw-bold">
                                                    $
                                                    {item.subtotal.toFixed(
                                                        2
                                                    )}
                                                </span>

                                            </div>

                                        </div>
                                    ))}

                                </div>

                            </div>

                            {/* =========================
                                ORDER FOOTER
                            ========================== */}
                            <div className="card-footer bg-white p-3 p-md-4">

                                <div className="row g-4">

                                    {/* =====================
                                        DELIVERY INFORMATION
                                    ====================== */}
                                    <div className="col-lg-7">

                                        <h6 className="fw-bold mb-3">
                                            Delivery Information
                                        </h6>

                                        <div className="row g-3">

                                            {/* Name */}
                                            <div className="col-sm-6">

                                                <small className="text-muted d-block">
                                                    Full Name
                                                </small>

                                                <span className="fw-semibold">
                                                    {order.full_name}
                                                </span>

                                            </div>

                                            {/* Phone */}
                                            <div className="col-sm-6">

                                                <small className="text-muted d-block">
                                                    Phone Number
                                                </small>

                                                <span className="fw-semibold">
                                                    {order.phone_number}
                                                </span>

                                            </div>

                                            {/* Address */}
                                            <div className="col-12">

                                                <small className="text-muted d-block">
                                                    Delivery Address
                                                </small>

                                                <span>
                                                    {order.delivery_address}
                                                </span>

                                            </div>

                                            {/* City */}
                                            <div className="col-sm-6">

                                                <small className="text-muted d-block">
                                                    City
                                                </small>

                                                <span>
                                                    {order.city}
                                                </span>

                                            </div>

                                            {/* Post Code */}
                                            <div className="col-sm-6">

                                                <small className="text-muted d-block">
                                                    Post Code
                                                </small>

                                                <span>
                                                    {order.post_code}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                    {/* =====================
                                        ORDER SUMMARY
                                    ====================== */}
                                    <div className="col-lg-5">

                                        <div className="bg-light rounded p-3 p-md-4">

                                            <h6 className="fw-bold mb-3">
                                                Order Summary
                                            </h6>

                                            {/* Subtotal */}
                                            <div className="d-flex justify-content-between mb-2">

                                                <span className="text-muted">
                                                    Subtotal
                                                </span>

                                                <span>
                                                    $
                                                    {order.subtotal.toFixed(
                                                        2
                                                    )}
                                                </span>

                                            </div>

                                            {/* Delivery */}
                                            <div className="d-flex justify-content-between mb-3">

                                                <span className="text-muted">
                                                    Delivery
                                                </span>

                                                <span
                                                    className={
                                                        order.delivery_fee ===
                                                            0
                                                            ? "text-success fw-semibold"
                                                            : ""
                                                    }
                                                >
                                                    {order.delivery_fee ===
                                                        0
                                                        ? "Free"
                                                        : `$${order.delivery_fee.toFixed(
                                                            2
                                                        )}`}
                                                </span>

                                            </div>

                                            <hr />

                                            {/* Total */}
                                            <div className="d-flex justify-content-between align-items-center">

                                                <span className="fw-bold">
                                                    Total
                                                </span>

                                                <span className="fs-5 fw-bold">
                                                    $
                                                    {order.total.toFixed(
                                                        2
                                                    )}
                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>
                    ))}

                </div>

            </div>
        </div>
    );
}

export default ProductOrder;