import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../api";
import { setSession } from "../App";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const user = await api.login({
        email: email.trim(),
        password,
      });

      setSession(user);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.message ||
          "Unable to sign in. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="page"
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        background: "#f5f7fb",
      }}
    >

      {/* ================= BRAND PANEL ================= */}

      <section
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          background:
            "linear-gradient(145deg, #173f5f 0%, #205b76 55%, #2a9d8f 140%)",
          color: "white",
        }}
      >

        <div style={{ maxWidth: "500px" }}>

          <div
            style={{
              width: "48px",
              height: "48px",
              display: "grid",
              placeItems: "center",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
              fontSize: "22px",
              fontWeight: "800",
              marginBottom: "28px",
            }}
          >
            L
          </div>

          <p
            style={{
              marginBottom: "12px",
              color: "#b9e3de",
              fontSize: "12px",
              fontWeight: "800",
              letterSpacing: "1.5px",
              textTransform: "uppercase",
            }}
          >
            Rental agreement management
          </p>

          <h1
            style={{
              marginBottom: "20px",
              fontSize: "clamp(36px, 4vw, 54px)",
              lineHeight: "1.08",
              letterSpacing: "-1.8px",
            }}
          >
            Agreements made
            <br />
            simple.
          </h1>

          <p
            style={{
              color: "#d9e7ee",
              fontSize: "16px",
              lineHeight: "1.75",
              maxWidth: "450px",
            }}
          >
            Create rental applications, invite tenants,
            collect digital signatures, and complete
            your agreement from one secure workspace.
          </p>

          <div
            style={{
              display: "grid",
              gap: "13px",
              marginTop: "34px",
            }}
          >

            {[
              "Guided Form P application",
              "Secure tenant invitations",
              "Digital signatures and final agreement",
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "11px",
                  color: "#eef7f8",
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                <span
                  style={{
                    width: "22px",
                    height: "22px",
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    background: "#2a9d8f",
                    fontSize: "11px",
                  }}
                >
                  ✓
                </span>

                {item}
              </div>
            ))}

          </div>

        </div>

      </section>

      {/* ================= LOGIN PANEL ================= */}

      <section
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 24px",
        }}
      >

        <div
          style={{
            width: "min(420px, 100%)",
          }}
        >

          <div
            style={{
              marginBottom: "30px",
            }}
          >

            <Link
              to="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "7px",
                color: "#64748b",
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "28px",
              }}
            >
              ← Back to home
            </Link>

            <h2
              style={{
                color: "#173f5f",
                fontSize: "30px",
                letterSpacing: "-0.8px",
                marginBottom: "8px",
              }}
            >
              Welcome back
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Sign in to continue managing your rental
              agreement.
            </p>

          </div>

          <div className="card">

            {error && (
              <div className="error">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label>Email address</label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  autoComplete="email"
                  required
                />
              </div>

              <div className="form-group">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <label>Password</label>
                </div>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="current-password"
                  required
                />
              </div>

              <button
                type="submit"
                className="primary-btn full-btn"
                disabled={loading}
                style={{
                  marginTop: "5px",
                  padding: "13px 18px",
                }}
              >
                {loading
                  ? "Signing in..."
                  : "Sign in to LeaseFlow →"}
              </button>

            </form>

            <div className="divider" />

            <p
              style={{
                textAlign: "center",
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Don't have an account?{" "}
              <Link
                to="/register"
                style={{
                  color: "#2a7f75",
                  fontWeight: "800",
                }}
              >
                Create one
              </Link>
            </p>

          </div>

          <p
            style={{
              marginTop: "20px",
              textAlign: "center",
              color: "#94a3b8",
              fontSize: "12px",
              lineHeight: "1.6",
            }}
          >
            LeaseFlow helps organize rental applications
            and signatures in one place.
          </p>

        </div>

      </section>

      {/* ================= RESPONSIVE OVERRIDE ================= */}

      <style>{`
        @media (max-width: 800px) {
          .page {
            grid-template-columns: 1fr !important;
          }

          .page > section:first-child {
            display: none !important;
          }
        }
      `}</style>

    </div>
  );
}

export default Login;
