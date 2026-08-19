import { Modal, Button, Form } from "react-bootstrap";
import { createOrder, createOrderFromHome } from "../../helper/service/product.service";
import { useApi } from "../../hooks/useApi";
import { useNavigate } from "react-router-dom";

interface OrderConfirmModalProps {
    show: boolean;
    onClose: () => void;
    // onConfirm: () => void;
    orderdProduct?: { quantity: number, product_id: number };
    total_price?: number;
}

const OrderConfirmModal = ({
    show,
    onClose,
    // onConfirm,
    orderdProduct,
    total_price,
}: OrderConfirmModalProps) => {

    const { handleRequest, isLoading } = useApi();
    const navigate = useNavigate()

    const onSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const fullName = formData.get("full_name") as string;
        const phoneNumber = formData.get("phone_number") as string;
        const address = formData.get("address") as string;
        const city = formData.get("city") as string;
        const postCode = formData.get("post_code") as string;

        // if (!orderedProduct || orderedProduct.length === 0) {
        //     console.error("No products found");
        //     return;
        // }

        const orderData = {
            product_id: orderdProduct?.product_id,
            quantity: orderdProduct?.quantity,
            full_name: fullName,
            phone_number: phoneNumber,
            delivery_address: address,
            city: city,
            post_code: postCode,
        };

        console.log("Order data:", orderData);

        const result = await handleRequest(
            orderdProduct?.product_id ? createOrderFromHome : createOrder,
            orderData
        );

        if (result.success) {
            // onConfirm();
            onClose();
            if (orderdProduct?.product_id) {
                navigate("/orders")
            }
        }
    };

    return (
        <Modal
            show={show}
            onHide={onClose}
            centered
            size="lg"
            backdrop="static"
            keyboard={false}
        >
            <Form onSubmit={onSubmit}>
                <Modal.Header closeButton>
                    <Modal.Title>
                        Confirm Your Order
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <h6 className="fw-semibold mb-3">
                        Shipping Address
                    </h6>

                    <Form.Group className="mb-3">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                            type="text"
                            name="full_name"
                            placeholder="Enter your full name"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Phone Number</Form.Label>
                        <Form.Control
                            type="tel"
                            name="phone_number"
                            placeholder="Enter your phone number"
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Address</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="address"
                            rows={3}
                            placeholder="Enter your shipping address"
                            required
                        />
                    </Form.Group>

                    <div className="row">
                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>City</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="city"
                                    placeholder="Enter city"
                                    required
                                />
                            </Form.Group>
                        </div>

                        <div className="col-md-6">
                            <Form.Group className="mb-3">
                                <Form.Label>Postal Code</Form.Label>
                                <Form.Control
                                    type="text"
                                    name="post_code"
                                    placeholder="Enter postal code"
                                    required
                                />
                            </Form.Group>
                        </div>
                    </div>

                    <hr />

                    <div className="d-flex justify-content-between">
                        <span className="fw-semibold">
                            Order Total
                        </span>

                        <span className="fw-bold">
                            ${total_price}
                        </span>
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>

                    <Button
                        variant="primary"
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Placing Order..." : "Place Order"}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
};

export default OrderConfirmModal;