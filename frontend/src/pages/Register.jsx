import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { api } from "../api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      await api.register({
        name: name.trim(),
        email: email.trim(),
        passwordHash: password,
      });

      navigate("/login");
    } catch (err) {
      setError(err.message || "Registration failed");
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
            Welcome to LeaseFlow
          </p>

          <h1
            style={{
              marginBottom: "20px",
              fontSize: "clamp(36px, 4vw, 54px)",
              lineHeight: "1.08",
              letterSpacing: "-1.8px",
            }}
          >
            Your rental
            <br />
            journey starts here.
          </h1>

          <p
            style={{
              color: "#d9e7ee",
              fontSize: "16px",
              lineHeight: "1.75",
              maxWidth: "450px",
            }}
          >
            Create your homeowner account and manage
            rental applications, tenant invitations,
            signatures, and completed agreements from
            one simple workspace.
          </p>

          <div
            style={{
              display: "grid",
              gap: "13px",
              marginTop: "34px",
            }}
          >
            {[
              "Create and manage rental applications",
              "Invite tenants securely by email",
              "Complete agreements with digital signatures",
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

      {/* ================= REGISTER PANEL ================= */}

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

          <div style={{ marginBottom: "30px" }}>

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
              Create your account
            </h2>

            <p
              style={{
                color: "#64748b",
                fontSize: "14px",
              }}
            >
              Get started with your digital rental
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

              {/* FULL NAME */}

              <div className="form-group">
                <label>Full name</label>

                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  autoComplete="name"
                  required
                />
              </div>

              {/* EMAIL */}

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

              {/* PASSWORD */}

              <div className="form-group">
                <label>Password</label>

                <input
                  type="password"
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  autoComplete="new-password"
                  minLength="6"
                  required
                />

                <small
                  style={{
                    display: "block",
                    marginTop: "7px",
                    color: "#94a3b8",
                    fontSize: "12px",
                  }}
                >
                  Use at least 6 characters.
                </small>
              </div>

              {/* BUTTON */}

              <button
                type="submit"
                className="primary-btn full-btn"
                disabled={loading}
                style={{
                  marginTop: "8px",
                  padding: "13px 18px",
                }}
              >
                {loading
                  ? "Creating account..."
                  : "Create LeaseFlow Account →"}
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
              Already have an account?{" "}
              <Link
                to="/login"
                style={{
                  color: "#2a7f75",
                  fontWeight: "800",
                }}
              >
                Sign in
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
            By creating an account, you can start
            building and managing your rental agreements
            digitally.
          </p>

        </div>
      </section>

      {/* ================= MOBILE ================= */}

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

export default Register;