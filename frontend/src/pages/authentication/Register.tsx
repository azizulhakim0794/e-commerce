import { Link } from "react-router-dom";
import { registerApi } from "../../helper/service/auth.service";

const Register = () => {
    const onSubmit = async (event: any) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const username = formData.get("name") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;
        const confarmation = formData.get("confarmation") as string;

        if (password !== confarmation) {
            console.error("Passwords do not match");
            return;
        }

        try {
            const response = await registerApi({
                username,
                email,
                password,
                confarmation
            });

            console.log("Registration successful:", response);
        } catch (error) {
            console.error("Registration failed:", error);
        }
    };
    return (
        <div className="row justify-content-center py-5">
            <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4 p-md-5">

                        {/* Header */}
                        <div className="text-center mb-4">
                            <div className="display-5 mb-3">🛍️</div>

                            <h2 className="fw-bold">
                                Create an Account
                            </h2>

                            <p className="text-muted">
                                Join MyShop and start shopping today.
                            </p>
                        </div>

                        {/* Registration Form */}
                        <form onSubmit={onSubmit}>

                            {/* Name */}
                            <div className="mb-3">
                                <label
                                    htmlFor="name"
                                    className="form-label fw-semibold"
                                >
                                    Full Name
                                </label>

                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="form-control"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>

                            {/* Email */}
                            <div className="mb-3">
                                <label
                                    htmlFor="email"
                                    className="form-label fw-semibold"
                                >
                                    Email Address
                                </label>

                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    className="form-control"
                                    placeholder="Enter your email"
                                    required
                                />
                            </div>

                            {/* Password */}
                            <div className="mb-3">
                                <label
                                    htmlFor="password"
                                    className="form-label fw-semibold"
                                >
                                    Password
                                </label>

                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="Create a password"
                                    required
                                />

                                <div className="form-text">
                                    Use at least 8 characters.
                                </div>
                            </div>

                            {/* Confirm Password */}
                            <div className="mb-3">
                                <label
                                    htmlFor="confarmation"
                                    className="form-label fw-semibold"
                                >
                                    Confirm Password
                                </label>

                                <input
                                    type="password"
                                    id="confarmation"
                                    name="confarmation"
                                    className="form-control"
                                    placeholder="Confirm your password"
                                    required
                                />
                            </div>

                            {/* Terms */}
                            <div className="form-check mb-4">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="terms"
                                    required
                                />

                                <label
                                    className="form-check-label"
                                    htmlFor="terms"
                                >
                                    I agree to the{" "}
                                    <Link
                                        to="/terms"
                                        className="text-decoration-none"
                                    >
                                        Terms & Conditions
                                    </Link>
                                </label>
                            </div>

                            {/* Register */}
                            <button
                                type="submit"
                                className="btn btn-primary w-100 py-2"
                            >
                                Create Account
                            </button>

                        </form>

                        {/* Login */}
                        <div className="text-center mt-4">
                            <span className="text-muted">
                                Already have an account?{" "}
                            </span>

                            <Link
                                to="/login"
                                className="text-decoration-none fw-semibold"
                            >
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