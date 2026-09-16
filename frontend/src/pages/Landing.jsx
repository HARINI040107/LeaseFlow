import { Link } from "react-router-dom";

function Landing() {
  return (
    <div className="landing-page">

      {/* NAVBAR */}
      <nav className="landing-navbar">

        <Link to="/" className="landing-logo">
          <span className="landing-logo-icon">L</span>
          <span>LeaseFlow</span>
        </Link>

        <div className="landing-nav-links">

          <Link
            to="/login"
            className="landing-login"
          >
            Login
          </Link>

          <Link
            to="/register"
            className="landing-nav-btn"
          >
            Get Started
          </Link>

        </div>

      </nav>

      {/* HERO */}
      <main className="landing-hero">

        <div className="landing-hero-content">

          <span className="landing-badge">
            Digital Rental Agreement
          </span>

          <h1>
            Rental agreements,
            <br />
            made simple.
          </h1>

          <p>
            Create your rental application, invite tenants,
            collect signatures, and complete the agreement
            online — all in one place.
          </p>

          <div className="landing-actions">

            <Link
              to="/register"
              className="landing-primary-btn"
            >
              Create an Application
              <span>→</span>
            </Link>

            <Link
              to="/login"
              className="landing-secondary-btn"
            >
              Sign In
            </Link>

          </div>

          <div className="landing-trust">
            <span>✓</span>
            Secure digital rental workflow
          </div>

        </div>

      </main>

      {/* HOW IT WORKS */}
      <section className="landing-how">

        <div className="landing-section-heading">

          <span>
            HOW IT WORKS
          </span>

          <h2>
            Simple from start to finish
          </h2>

          <p>
            Everything you need to complete a rental
            agreement digitally.
          </p>

        </div>

        <div className="landing-steps">

          <div className="landing-step">

            <div className="landing-step-number">
              01
            </div>

            <h3>
              Create
            </h3>

            <p>
              Homeowners create and complete
              the rental application.
            </p>

          </div>

          <div className="landing-step">

            <div className="landing-step-number">
              02
            </div>

            <h3>
              Invite
            </h3>

            <p>
              Tenants receive a secure link
              to complete their information.
            </p>

          </div>

          <div className="landing-step">

            <div className="landing-step-number">
              03
            </div>

            <h3>
              Sign
            </h3>

            <p>
              Required parties upload their
              digital signatures.
            </p>

          </div>

          <div className="landing-step">

            <div className="landing-step-number">
              04
            </div>

            <h3>
              Complete
            </h3>

            <p>
              Generate the completed rental
              agreement as a PDF.
            </p>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="landing-footer">

        <strong>
          LeaseFlow
        </strong>

        <span>
          Digital Rental Agreement Management
        </span>

      </footer>

    </div>
  );
}

export default Landing;