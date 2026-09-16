import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { api } from "../api";
import { clearSession, getSession } from "../App";

function Dashboard() {
  const navigate = useNavigate();
  const user = getSession();

  const [loading, setLoading] = useState(false);

  const [application, setApplication] = useState(() => {
    try {
      const saved = localStorage.getItem("lease_application");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const handleCreateApplication = async () => {
    setLoading(true);

    try {
      const newApplication =
        await api.createApplication(user.id);

      setApplication(newApplication);

      localStorage.setItem(
        "lease_application",
        JSON.stringify(newApplication)
      );

      navigate(`/application/${newApplication.id}`);
    } catch (error) {
      alert(
        error.message ||
          "Unable to create application"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearSession();
    navigate("/");
  };

  const status = application?.status || "DRAFT";

  const statusLabel = status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );

  return (
    <div className="page">

      {/* ================= NAVBAR ================= */}

      <nav className="navbar">

        <Link to="/dashboard" className="logo">
          LeaseFlow
        </Link>

        <div className="nav-links">

          <span className="muted">
            {user?.name || "Homeowner"}
          </span>

          <button
            className="secondary-btn"
            onClick={handleLogout}
          >
            Logout
          </button>

        </div>

      </nav>

      {/* ================= DASHBOARD ================= */}

      <main className="container dashboard">

        {/* Header */}

        <div className="dashboard-header">

          <div>

            <span className="badge">
              Homeowner Workspace
            </span>

            <h1 style={{ marginTop: "12px" }}>
              Welcome back, {user?.name || "Homeowner"}
            </h1>

            <p>
              Manage your rental agreement from one
              simple workspace.
            </p>

          </div>

          <button
            className="primary-btn"
            onClick={handleCreateApplication}
            disabled={loading}
          >
            {loading
              ? "Creating..."
              : "+ New Application"}
          </button>

        </div>

        {/* ================= STATS ================= */}

        <div className="stats-grid">

          <div className="stat-card">

            <div className="stat-label">
              Applications
            </div>

            <div className="stat-value">
              {application ? "1" : "0"}
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-label">
              Current Status
            </div>

            <div
              className="stat-value"
              style={{
                fontSize: "20px",
                marginTop: "12px",
              }}
            >
              {application
                ? statusLabel
                : "No application"}
            </div>

          </div>

          <div className="stat-card">

            <div className="stat-label">
              Workflow
            </div>

            <div
              className="stat-value"
              style={{
                fontSize: "20px",
                marginTop: "12px",
              }}
            >
              Form P
            </div>

          </div>

        </div>

        {/* ================= APPLICATION ================= */}

        <div className="section-title">
          Your application
        </div>

        {!application ? (

          <div className="empty-state">

            <div
              style={{
                width: "58px",
                height: "58px",
                margin: "0 auto 18px",
                borderRadius: "16px",
                display: "grid",
                placeItems: "center",
                background: "#eef6f5",
                color: "#173f5f",
                fontSize: "24px",
                fontWeight: "800",
              }}
            >
              +
            </div>

            <h3>
              Start your first rental agreement
            </h3>

            <p>
              Complete the Form P information step by
              step, invite your tenants, collect
              signatures, and generate the final agreement.
            </p>

            <button
              className="primary-btn"
              onClick={handleCreateApplication}
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Rental Application"}
            </button>

          </div>

        ) : (

          <div className="application-list">

            <div className="application-item">

              <div>

                <span className="badge">
                  Rental Agreement
                </span>

                <h3 style={{ marginTop: "11px" }}>
                  Residential Tenancy Application
                </h3>

                <p>
                  Application ID:{" "}
                  {application.id}
                </p>

                <p>
                  Current status:{" "}
                  <strong>
                    {statusLabel}
                  </strong>
                </p>

              </div>

              <Link
                to={`/application/${application.id}`}
                className="primary-btn"
              >
                Continue →
              </Link>

            </div>

          </div>

        )}

        {/* ================= WORKFLOW INFO ================= */}

        <div
          className="card"
          style={{
            marginTop: "28px",
            background:
              "linear-gradient(135deg, #173f5f 0%, #205b76 100%)",
            color: "white",
            border: "none",
          }}
        >

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "28px",
              flexWrap: "wrap",
            }}
          >

            <div style={{ maxWidth: "650px" }}>

              <p
                style={{
                  color: "#b9e3de",
                  fontSize: "12px",
                  fontWeight: "800",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  marginBottom: "8px",
                }}
              >
                How LeaseFlow works
              </p>

              <h2
                style={{
                  fontSize: "22px",
                  marginBottom: "8px",
                }}
              >
                One guided workflow from application
                to signed agreement.
              </h2>

              <p
                style={{
                  color: "#d9e7ee",
                  fontSize: "14px",
                  lineHeight: "1.65",
                }}
              >
                Complete the required information,
                invite your tenants through secure links,
                collect digital signatures, and finish
                with a downloadable rental agreement.
              </p>

            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
              }}
            >

              {[
                "Application",
                "Tenant",
                "Sign",
                "Complete",
              ].map((step, index) => (
                <div
                  key={step}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "9px 12px",
                    borderRadius: "999px",
                    background:
                      "rgba(255,255,255,0.10)",
                    border:
                      "1px solid rgba(255,255,255,0.14)",
                    fontSize: "12px",
                    fontWeight: "700",
                  }}
                >
                  <span
                    style={{
                      width: "22px",
                      height: "22px",
                      display: "grid",
                      placeItems: "center",
                      borderRadius: "50%",
                      background: "#2a9d8f",
                      color: "white",
                      fontSize: "11px",
                    }}
                  >
                    {index + 1}
                  </span>

                  {step}
                </div>
              ))}

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}

export default Dashboard;
