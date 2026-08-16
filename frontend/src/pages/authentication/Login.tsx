import { Link, useNavigate } from "react-router-dom";
import { loginApi } from "../../helper/service/auth.service";
import { useAuthStore } from "../../stores/auth.store";

const Login = () => {
    const navigate = useNavigate();
    const setUser = useAuthStore((state) => state.setUser);

    const onSubmit = async (event: any) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);

        const username = formData.get("email") as string;
        const password = formData.get("password") as string;

        try {
            const response = await loginApi({
                username,
                password
            });

            console.log("Login successful:", response.data);
            setUser(response.data.user);
            navigate("/");
        } catch (error) {
            console.error("Login failed:", error);
        }
    };
    return (
        <div className="row justify-content-center pb-5">
            <div className="col-12 col-sm-10 col-md-7 col-lg-5 col-xl-4">
                <div className="card border-0 shadow-sm">
                    <div className="card-body p-4 p-md-5">

                        {/* Header */}
                        <div className="text-center mb-4">
                            <div className="display-5 mb-3">🛍️</div>

                            <h2 className="fw-bold">
                                Welcome Back
                            </h2>

                            <p className="text-muted">
                                Login to continue shopping with MyShop.
                            </p>
                        </div>

                        {/* Login Form */}
                        <form onSubmit={onSubmit}>
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
                                <div className="d-flex justify-content-between">
                                    <label
                                        htmlFor="password"
                                        className="form-label fw-semibold"
                                    >
                                        Password
                                    </label>

                                    <Link
                                        to="/forgot-password"
                                        className="text-decoration-none small"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    className="form-control"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            {/* Remember Me */}
                            <div className="form-check mb-4">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="rememberMe"
                                />

                                <label
                                    className="form-check-label"
                                    htmlFor="rememberMe"
                                >
                                    Remember me
                                </label>
                            </div>

                            {/* Login Button */}
                            <button
                                type="submit"
                                className="btn btn-primary w-100 py-2"
                            >
                                Login
                            </button>
                        </form>

                        {/* Registration */}
                        <div className="text-center mt-4">
                            <span className="text-muted">
                                Don't have an account?{" "}
                            </span>

                            <Link
                                to="/register"
                                className="text-decoration-none fw-semibold"
                            >
                                Create Account
                            </Link>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;