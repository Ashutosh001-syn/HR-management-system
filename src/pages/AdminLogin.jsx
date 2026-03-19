import { loginAdmin } from "@/api/adminApi";
import Logo from "@/assets/Inmortallogo.png";
import "./AdminLogin.css";
import { useState } from "react";
import { FaArrowRight, FaEnvelope, FaEye, FaEyeSlash, FaLock, FaShieldAlt, FaUserShield } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [form, setForm] = useState({ Email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!form.Email.trim() || !form.password.trim()) {
      setError("Email and password are required");
      return;
    }

    try {
      setLoading(true);
      const response = await loginAdmin({
        email: form.Email.trim(),
        password: form.password,
      });

      const isSuccess =
        response?.status === "true" ||
        response?.success === true ||
        response?.success === "true";

      if (isSuccess && response?.userid) {
        localStorage.setItem("userid", response.userid);
        navigate("/dashboard", { replace: true });
        return;
      }

      setError(response?.message || "Invalid credentials or login failed");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-shell">
        <section className="admin-login-brand">
          <div className="admin-login-brand__badge">
            <FaShieldAlt />
            <span>Secure Admin Access</span>
          </div>

          <div className="admin-login-brand__content">
            <img src={Logo} alt="Company logo" className="admin-login-brand__logo" />
            <p className="admin-login-brand__eyebrow">Human Resource Management</p>
            <h1 className="admin-login-brand__title">Run approvals, employee records, and attendance from one control center.</h1>
            <p className="admin-login-brand__text">
              Sign in to manage workforce operations with a cleaner admin workspace built for fast daily decisions.
            </p>
          </div>

          <div className="admin-login-brand__stats">
            <div className="admin-login-stat">
              <span className="admin-login-stat__label">Workflow</span>
              <strong className="admin-login-stat__value">Leaves and attendance</strong>
            </div>
            <div className="admin-login-stat">
              <span className="admin-login-stat__label">Access</span>
              <strong className="admin-login-stat__value">Admin-only dashboard</strong>
            </div>
          </div>
        </section>

        <section className="admin-login-panel">
          <div className="admin-login-card">
            <div className="admin-login-card__header">
              <div className="admin-login-card__icon">
                <FaUserShield />
              </div>
              <div>
                <p className="admin-login-card__eyebrow">Administrator Sign In</p>
                <h2 className="admin-login-card__title">Welcome back</h2>
                <p className="admin-login-card__text">Use your admin email and password to continue.</p>
              </div>
            </div>

            {error && <div className="alert alert-danger py-2 admin-login-alert">{error}</div>}

            <form onSubmit={onSubmit} className="admin-login-form">
              <label className="admin-login-field">
                <span className="admin-login-field__label">Email Address</span>
                <div className="admin-login-field__control">
                  <FaEnvelope className="admin-login-field__icon" />
                  <input
                    type="email"
                    name="Email"
                    className="form-control"
                    placeholder="Enter your email"
                    value={form.Email}
                    onChange={onChange}
                    autoComplete="email"
                  />
                </div>
              </label>

              <label className="admin-login-field">
                <span className="admin-login-field__label">Password</span>
                <div className="admin-login-field__control">
                  <FaLock className="admin-login-field__icon" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="form-control admin-login-field__input--password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={onChange}
                    autoComplete="current-password"
                  />

                  <button
                    type="button"
                    className="admin-login-field__toggle"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </label>

              <button
                type="submit"
                className="btn admin-login-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <span>Enter Dashboard</span>
                    <FaArrowRight />
                  </>
                )}
              </button>
            </form>

            <div className="admin-login-footer">
              <div className="admin-login-footer__item">Protected admin route</div>
              <div className="admin-login-footer__item">Session starts after valid login</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
