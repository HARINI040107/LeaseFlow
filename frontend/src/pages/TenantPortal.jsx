import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { api } from "../api";

export default function TenantPortal() {
  const { token } = useParams();

  const [invitation, setInvitation] =
    useState(null);

  const [party, setParty] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    dateOfBirth: "",
  });

  const [signature, setSignature] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [submitting, setSubmitting] =
    useState(false);

  const [completed, setCompleted] =
    useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  useEffect(() => {
    loadInvitation();
  }, [token]);

  async function loadInvitation() {
    try {
      setLoading(true);
      setError("");

      const data =
        await api.getTenantApplication(token);

      setInvitation(data);

      const parties =
        await api.getParties(
          data.applicationId
        );

      const matchingParty =
        (parties || []).find(
          (item) =>
            String(item.id) ===
            String(data.partyId)
        );

      if (!matchingParty) {
        throw new Error(
          "The tenant associated with this invitation could not be found."
        );
      }

      setParty(matchingParty);

      setForm({
        name:
          matchingParty.name || "",
        email:
          matchingParty.email || "",
        dateOfBirth:
          matchingParty.dateOfBirth || "",
      });

    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "This invitation is invalid or has expired."
      );
    } finally {
      setLoading(false);
    }
  }

  function updateForm(field, value) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleSignatureUpload(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please upload a PNG or JPG image."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Signature image must be smaller than 5 MB."
      );
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const canvas =
          document.createElement("canvas");

        const context =
          canvas.getContext("2d");

        canvas.width =
          image.width;

        canvas.height =
          image.height;

        context.fillStyle =
          "#ffffff";

        context.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        );

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        );

        const result =
          canvas.toDataURL(
            "image/jpeg",
            0.95
          );

        setSignature(result);
        setError("");
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (!form.name.trim()) {
      setError(
        "Please enter your full name."
      );
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    if (!form.dateOfBirth) {
      setError(
        "Please enter your date of birth."
      );
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    if (!signature) {
      setError(
        "Please upload your signature."
      );
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }

    if (!invitation || !party) {
      setError(
        "Invitation information is unavailable."
      );
      return;
    }

    try {
      setSubmitting(true);

      /*
       * UPDATE TENANT DETAILS
       */
      await api.updateParty(
        invitation.applicationId,
        party.id,
        {
          name: form.name,
          email: form.email,
          dateOfBirth:
            form.dateOfBirth,
        }
      );

      /*
       * SECTION 1
       *
       * Tenant confirms their
       * personal information.
       */
      await api.saveSection(
        invitation.applicationId,
        "1",
        {
          tenantId: party.id,
          tenantName: form.name,
          tenantEmail: form.email,
          tenantDateOfBirth:
            form.dateOfBirth,
        },
        true
      );

      /*
       * TENANT SIGNATURE
       */
      await api.saveSignature(
        invitation.applicationId,
        party.id,
        signature,
        "TENANT"
      );

      /*
       * COMPLETE INVITATION
       */
      await api.completeTenantApplication(
        token
      );

      /*
       * UPDATE APPLICATION STATUS
       */
      await api.updateApplicationStatus(
        invitation.applicationId,
        "TENANT_COMPLETED"
      );

      setCompleted(true);

    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to submit your application."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setSubmitting(false);
    }
  }

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="tenant-page">

        <header className="tenant-navbar">
          <div className="logo">
            LeaseFlow
          </div>

          <span className="tenant-secure">
            🔒 Secure
          </span>
        </header>

        <div className="tenant-loading">

          <div className="loader"></div>

          <h2>
            Verifying your invitation
          </h2>

          <p>
            Please wait while we securely
            load your rental application.
          </p>

        </div>
      </div>
    );
  }

  /* =========================
     INVALID INVITATION
  ========================= */

  if (error && !invitation) {
    return (
      <div className="tenant-page">

        <header className="tenant-navbar">
          <div className="logo">
            LeaseFlow
          </div>
        </header>

        <main className="tenant-main">

          <div className="tenant-card error-card">

            <div className="error-icon">
              !
            </div>

            <span className="tenant-eyebrow">
              SECURE INVITATION
            </span>

            <h1>
              Invitation unavailable
            </h1>

            <p>
              {error}
            </p>

          </div>

        </main>
      </div>
    );
  }

  /* =========================
     COMPLETED
  ========================= */

  if (completed) {
    return (
      <div className="tenant-page">

        <header className="tenant-navbar">

          <div className="logo">
            LeaseFlow
          </div>

          <span className="tenant-secure">
            ✓ Submitted
          </span>

        </header>

        <main className="tenant-main">

          <div className="tenant-card completion-card">

            <div className="success-icon">
              ✓
            </div>

            <span className="tenant-eyebrow">
              SUBMISSION COMPLETE
            </span>

            <h1>
              You're all set
            </h1>

            <p>
              Thank you,{" "}
              <strong>
                {form.name}
              </strong>
              . Your tenant information and
              signature have been submitted
              successfully.
            </p>

            <div className="completion-box">

              <div>
                <span>
                  TENANT
                </span>

                <strong>
                  {form.name}
                </strong>
              </div>

              <div>
                <span>
                  SIGNATURE
                </span>

                <strong className="success-text">
                  ✓ Submitted
                </strong>
              </div>

            </div>

            <div className="tenant-next-step">

              <div className="next-icon">
                →
              </div>

              <div>
                <strong>
                  What's next?
                </strong>

                <p>
                  The homeowner will review the
                  completed agreement and finish
                  the homeowner signing step.
                </p>
              </div>

            </div>

          </div>

        </main>

        <footer className="tenant-footer">
          <strong>LeaseFlow</strong>
          <span>•</span>
          <span>
            Secure rental agreement
          </span>
        </footer>

      </div>
    );
  }

  /* =========================
     TENANT FORM
  ========================= */

  return (
    <div className="tenant-page">

      <header className="tenant-navbar">

        <div className="logo">
          LeaseFlow
        </div>

        <div className="tenant-secure">
          🔒 Secure application
        </div>

      </header>

      <main className="tenant-main">

        {/* HEADER */}

        <div className="tenant-page-header">

          <div>

            <span className="tenant-eyebrow">
              TENANT INVITATION
            </span>

            <h1>
              Complete your rental agreement
            </h1>

            <p>
              Confirm your information and
              electronically sign the agreement.
            </p>

          </div>

          <div className="tenant-invite-status">
            Secure link
          </div>

        </div>

        {error && (
          <div className="tenant-alert">
            <span>!</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* =================
              PERSONAL INFO
          ================= */}

          <section className="tenant-form-card">

            <div className="tenant-card-header">

              <div className="tenant-section-number">
                01
              </div>

              <div>
                <h2>
                  Your Information
                </h2>

                <p>
                  Confirm the information that
                  will appear on the rental
                  agreement.
                </p>
              </div>

            </div>

            <div className="tenant-form-grid">

              <div className="tenant-field tenant-full">
                <label>
                  Full Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(event) =>
                    updateForm(
                      "name",
                      event.target.value
                    )
                  }
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="tenant-field">
                <label>
                  Email Address
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    updateForm(
                      "email",
                      event.target.value
                    )
                  }
                  placeholder="your@email.com"
                />
              </div>

              <div className="tenant-field">
                <label>
                  Date of Birth
                  <span>*</span>
                </label>

                <input
                  type="date"
                  value={form.dateOfBirth}
                  onChange={(event) =>
                    updateForm(
                      "dateOfBirth",
                      event.target.value
                    )
                  }
                  required
                />
              </div>

            </div>

            <div className="tenant-info-note">

              <span>i</span>

              <p>
                Your date of birth is used to
                determine whether you are
                recorded as a tenant or
                occupant.
              </p>

            </div>

          </section>

          {/* =================
              APPLICATION SUMMARY
          ================= */}

          <section className="tenant-form-card">

            <div className="tenant-card-header">

              <div className="tenant-section-number">
                ✓
              </div>

              <div>
                <h2>
                  Application Confirmation
                </h2>

                <p>
                  Review the information before
                  signing.
                </p>
              </div>

            </div>

            <div className="tenant-confirm-grid">

              <div className="tenant-confirm-item">
                <span>
                  NAME
                </span>

                <strong>
                  {form.name ||
                    "Not provided"}
                </strong>
              </div>

              <div className="tenant-confirm-item">
                <span>
                  EMAIL
                </span>

                <strong>
                  {form.email ||
                    "Not provided"}
                </strong>
              </div>

              <div className="tenant-confirm-item">
                <span>
                  DATE OF BIRTH
                </span>

                <strong>
                  {form.dateOfBirth ||
                    "Not provided"}
                </strong>
              </div>

            </div>

          </section>

          {/* =================
              SIGNATURE
          ================= */}

          <section className="tenant-signature-card">

            <div className="tenant-card-header">

              <div className="tenant-section-number">
                02
              </div>

              <div>
                <h2>
                  Digital Signature
                </h2>

                <p>
                  Upload a clear image of your
                  handwritten signature.
                </p>
              </div>

            </div>

            <div className="tenant-signature-inner">

              <label className="tenant-upload-label">
                Signature Image
                <span>*</span>
              </label>

              <label className="signature-upload">

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={
                    handleSignatureUpload
                  }
                />

                <div className="upload-icon">
                  ↑
                </div>

                <strong>
                  Upload your signature
                </strong>

                <span>
                  PNG or JPG · Max 5 MB
                </span>

              </label>

              {signature && (
                <div className="signature-preview">

                  <div className="signature-preview-header">

                    <span>
                      Signature Preview
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        setSignature("")
                      }
                    >
                      Remove
                    </button>

                  </div>

                  <div className="signature-image-box">

                    <img
                      src={signature}
                      alt="Tenant signature"
                    />

                  </div>

                </div>
              )}

              <div className="signature-notice">

                <span>✓</span>

                <p>
                  By submitting, your uploaded
                  signature will be stored with
                  this rental application.
                </p>

              </div>

            </div>

          </section>

          {/* =================
              SUBMIT
          ================= */}

          <section className="tenant-submit">

            <div>

              <h3>
                Ready to submit?
              </h3>

              <p>
                Make sure your information and
                signature are correct.
              </p>

            </div>

            <button
              type="submit"
              className="primary-btn"
              disabled={submitting}
            >
              {submitting
                ? "Submitting..."
                : "Sign & Submit →"}
            </button>

          </section>

        </form>

        <footer className="tenant-footer">
          <strong>LeaseFlow</strong>
          <span>•</span>
          <span>
            Secure rental agreement
          </span>
        </footer>

      </main>
    </div>
  );
}