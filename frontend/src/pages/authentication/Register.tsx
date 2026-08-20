import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuthErrorMessage, registerApi } from "../../helper/service/auth.service";
import { useAuthStore } from "../../stores/auth.store";

const Register = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setIsSubmitting(true);

        const formData = new FormData(event.currentTarget);
        const username = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confirmation = formData.get("confirmation") as string;

        if (password !== confirmation) {
            setError("Passwords do not match.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await registerApi({
                username,
                email,
                password,
                confirmation,
            });
            setUser(response.data.user);
            navigate("/");
        } catch (registerError) {
            setError(
                getAuthErrorMessage(
                    registerError,
                    "Unable to create your account. Please try again."
                )
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="row justify-content-center py-5">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4 p-md-5">
                        <div className="text-center mb-4">
                            <div className="display-5 mb-3">🛍️</div>
                            <h2 className="fw-bold">Create an Account</h2>
                            <p className="text-muted">
                                Join MyShop and start shopping today.
                            </p>
                        </div>

                        {error && (
                            <div className="alert alert-danger" role="alert">
                                {error}
                            </div>
                        )}

                        <form onSubmit={onSubmit}>
                            <div className="mb-3">
                                <label htmlFor="name" className="form-label fw-semibold">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="form-control"
                                    placeholder="Enter your full name"
                                    autoComplete="name"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="email" className="form-label fw-semibold">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="password" className="form-label fw-semibold">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="Create a password"
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                    disabled={isSubmitting}
                                />
                                <div className="form-text">Use at least 8 characters.</div>
                            </div>

                            <div className="mb-3">
                                <label htmlFor="confirmation" className="form-label fw-semibold">
                                    Confirm Password
                                </label>
                                <input
                                    type="password"
                                    id="confirmation"
                                    name="confirmation"
                                    className="form-control"
                                    placeholder="Confirm your password"
                                    autoComplete="new-password"
                                    minLength={8}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="form-check mb-4">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="terms"
                                    required
                                    disabled={isSubmitting}
                                />
                                <label className="form-check-label" htmlFor="terms">
                                    I agree to the{" "}
                                    <span className="text-decoration-none">
                                        Terms & Conditions
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="btn btn-primary w-100 py-2"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating account..." : "Create Account"}
                            </button>
                        </form>

                        <div className="text-center mt-4">
                            <span className="text-muted">Already have an account? </span>
                            <Link to="/login" className="text-decoration-none fw-semibold">
                                Login
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
