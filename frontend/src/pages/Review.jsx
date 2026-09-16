import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";
import { getSession } from "../App";

const HOMEOWNER_SECTIONS = [
  "1",
  "3",
  "9",
  "11",
  "13",
  "16",
  "17",
  "18",
  "19",
  "23",
];

export default function Review() {
  const { id } = useParams();
  const navigate = useNavigate();
  const session = getSession();

  const [application, setApplication] =
    useState(null);

  const [parties, setParties] =
    useState([]);

  const [signatures, setSignatures] =
    useState([]);

  const [sections, setSections] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [busy, setBusy] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [signature, setSignature] =
    useState("");

  useEffect(() => {
    loadReview();
  }, [id]);

  async function loadReview() {
    try {
      setLoading(true);
      setError("");

      const [
        applicationData,
        partiesData,
        signaturesData,
      ] = await Promise.all([
        api.getApplication(id),
        api.getParties(id),
        api.getSignatures(id),
      ]);

      setApplication(applicationData);
      setParties(partiesData || []);
      setSignatures(signaturesData || []);

      const sectionData = {};

      for (const number of HOMEOWNER_SECTIONS) {
        try {
          const result =
            await api.getSection(id, number);

          if (result) {
            sectionData[number] = result;
          }
        } catch {
          // Section may not exist yet.
        }
      }

      setSections(sectionData);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to load application."
      );
    } finally {
      setLoading(false);
    }
  }

  function getTenants() {
    return parties.filter(
      (party) =>
        party.partyType === "TENANT" ||
        party.type === "TENANT"
    );
  }

  function getOccupants() {
    return parties.filter(
      (party) =>
        party.partyType === "OCCUPANT" ||
        party.type === "OCCUPANT"
    );
  }

  function hasSignature(partyId) {
    return signatures.some(
      (item) =>
        String(item.partyId) ===
        String(partyId)
    );
  }

  function hasHomeownerSignature() {
    return signatures.some(
      (item) =>
        item.signerType === "HOMEOWNER"
    );
  }

  async function sendInvitation(party) {
    try {
      if (!party.email) {
        setError(
          `${party.name} does not have an email address.`
        );
        return;
      }

      setBusy(true);
      setError("");
      setMessage("");

      const response =
        await api.createInvitation(id, {
          partyId: party.id,
          email: party.email,
          tenantName: party.name,
        });

      setMessage(
        `Invitation sent to ${party.email}.`
      );

      console.log(
        "Invitation link:",
        response?.invitationLink
      );
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to send invitation."
      );
    } finally {
      setBusy(false);
    }
  }

  function handleSignatureUpload(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError(
        "Please upload a PNG or JPG signature image."
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Signature image must be smaller than 5 MB."
      );
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const image = new Image();

      image.onload = () => {
        const canvas =
          document.createElement("canvas");

        const context =
          canvas.getContext("2d");

        canvas.width = image.width;
        canvas.height = image.height;

        context.fillStyle = "#ffffff";

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

  async function signAsHomeowner() {
    if (!signature) {
      setError(
        "Please upload your signature first."
      );
      return;
    }

    if (!session?.id) {
      setError(
        "Homeowner session not found. Please log in again."
      );
      return;
    }

    try {
      setBusy(true);
      setError("");
      setMessage("");

      await api.saveSignature(
        id,
        session.id,
        signature,
        "HOMEOWNER"
      );

      await api.updateApplicationStatus(
        id,
        "HOMEOWNER_SIGNED"
      );

      setSignature("");

      setMessage(
        "Homeowner signature saved successfully."
      );

      await loadReview();
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to save homeowner signature."
      );
    } finally {
      setBusy(false);
    }
  }

  async function generatePdf() {
    try {
      setBusy(true);
      setError("");
      setMessage("");

      const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/applications/${id}/pdf`
);
      if (!response.ok) {
        const text =
          await response.text();

        throw new Error(
          text ||
            "Unable to generate PDF."
        );
      }

      const blob =
        await response.blob();

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        `leaseflow-rental-agreement-${id}.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      setMessage(
        "Rental agreement PDF generated successfully."
      );

      await loadReview();
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Unable to generate PDF."
      );
    } finally {
      setBusy(false);
    }
  }

  function parseSection(section) {
    if (!section) return null;

    let data =
      section.sectionData ??
      section.data ??
      section;

    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        return data;
      }
    }

    return data;
  }

  function formatLabel(value) {
    return String(value)
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/^./, (char) =>
        char.toUpperCase()
      );
  }

  function formatValue(value) {
    if (
      value === null ||
      value === undefined ||
      value === ""
    ) {
      return "Not provided";
    }

    if (typeof value === "boolean") {
      return value ? "Yes" : "No";
    }

    if (
      typeof value === "object"
    ) {
      return Object.entries(value)
        .map(
          ([key, item]) =>
            `${formatLabel(key)}: ${formatValue(item)}`
        )
        .join(" • ");
    }

    return String(value);
  }

  function renderSection(number) {
    const section =
      sections[number];

    if (!section) {
      return (
        <div className="review-empty">
          Not completed yet.
        </div>
      );
    }

    const data =
      parseSection(section);

    if (
      !data ||
      typeof data !== "object"
    ) {
      return (
        <div className="review-section-text">
          {formatValue(data)}
        </div>
      );
    }

    return (
      <div className="review-data-grid">
        {Object.entries(data).map(
          ([key, value]) => (
            <div
              className="review-data-item"
              key={key}
            >
              <span className="review-data-label">
                {formatLabel(key)}
              </span>

              <span className="review-data-value">
                {formatValue(value)}
              </span>
            </div>
          )
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="review-page">
        <div className="review-state-card">
          <div className="review-loader"></div>

          <h2>
            Loading application
          </h2>

          <p>
            Preparing your rental agreement
            review.
          </p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="review-page">
        <div className="review-state-card">
          <div className="review-state-icon">
            !
          </div>

          <h2>
            Application not found
          </h2>

          <p>
            We couldn't find this application.
          </p>

          <button
            className="primary-btn"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const tenants =
    getTenants();

  const occupants =
    getOccupants();

  const homeownerSigned =
    hasHomeownerSignature();

  const allTenantsSigned =
    tenants.length > 0 &&
    tenants.every((tenant) =>
      hasSignature(tenant.id)
    );

  const canGenerate =
    homeownerSigned &&
    allTenantsSigned;

  const signedTenantCount =
    tenants.filter((tenant) =>
      hasSignature(tenant.id)
    ).length;

  const completedCount =
    Number(homeownerSigned) +
    signedTenantCount;

  const totalSigners =
    tenants.length + 1;

  const progress =
    totalSigners > 0
      ? Math.round(
          (completedCount /
            totalSigners) *
            100
        )
      : 0;

  return (
    <div className="review-page">

      <header className="review-navbar">
        <div className="logo">
          LeaseFlow
        </div>

        <button
          className="review-back"
          onClick={() =>
            navigate("/dashboard")
          }
        >
          ← Dashboard
        </button>
      </header>

      <main className="review-main">

        {/* HEADER */}

        <div className="review-page-header">
          <div>
            <span className="review-eyebrow">
              APPLICATION REVIEW
            </span>

            <h1>
              Review Rental Agreement
            </h1>

            <p>
              Review the completed sections,
              invite tenants, and collect all
              required signatures.
            </p>
          </div>

          <div className="review-status">
            <span>STATUS</span>

            <strong>
              {application.status ||
                "DRAFT"}
            </strong>
          </div>
        </div>

        {/* PROGRESS */}

        <section className="review-overview">
          <div className="review-overview-main">
            <div className="review-overview-icon">
              ✓
            </div>

            <div>
              <span>
                SIGNATURE PROGRESS
              </span>

              <strong>
                {completedCount} of{" "}
                {totalSigners} signatures
              </strong>
            </div>
          </div>

          <div className="review-progress-track">
            <div
              className="review-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <span className="review-progress-percent">
            {progress}%
          </span>
        </section>

        {/* MESSAGES */}

        {message && (
          <div className="review-success">
            <span>✓</span>
            {message}
          </div>
        )}

        {error && (
          <div className="review-error">
            <span>!</span>
            {error}
          </div>
        )}

        {/* PARTIES */}

        <section className="review-card">
          <ReviewCardHeader
            number="01"
            title="Parties"
            description="Tenants and occupants included in this rental agreement."
          />

          <div className="review-party-list">

            {tenants.map(
              (tenant, index) => {
                const signed =
                  hasSignature(
                    tenant.id
                  );

                return (
                  <div
                    className="review-party"
                    key={tenant.id}
                  >
                    <div className="review-party-main">
                      <div className="review-avatar">
                        {tenant.name
                          ?.charAt(0)
                          ?.toUpperCase() ||
                          "T"}
                      </div>

                      <div>
                        <div className="review-party-label">
                          Tenant {index + 1}
                        </div>

                        <h3>
                          {tenant.name}
                        </h3>

                        <p>
                          {tenant.email ||
                            "No email provided"}
                        </p>
                      </div>
                    </div>

                    <div className="review-party-action">
                      {signed ? (
                        <span className="review-signed">
                          ✓ Signed
                        </span>
                      ) : (
                        <button
                          className="secondary-btn"
                          disabled={
                            busy ||
                            !tenant.email
                          }
                          onClick={() =>
                            sendInvitation(
                              tenant
                            )
                          }
                        >
                          ✉ Send Invitation
                        </button>
                      )}
                    </div>
                  </div>
                );
              }
            )}

            {occupants.map(
              (occupant, index) => (
                <div
                  className="review-party occupant-party"
                  key={occupant.id}
                >
                  <div className="review-party-main">
                    <div className="review-avatar occupant-avatar">
                      {occupant.name
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "O"}
                    </div>

                    <div>
                      <div className="review-party-label">
                        Occupant {index + 1}
                      </div>

                      <h3>
                        {occupant.name}
                      </h3>

                      <span className="review-occupant-tag">
                        OCCUPANT
                      </span>
                    </div>
                  </div>

                  <span className="review-no-sign">
                    Does not sign
                  </span>
                </div>
              )
            )}

            {tenants.length === 0 &&
              occupants.length === 0 && (
                <div className="review-empty-large">
                  No parties have been added yet.
                </div>
              )}

          </div>
        </section>

        {/* FORM SECTIONS */}

        <section className="review-card">
          <ReviewCardHeader
            number="02"
            title="Completed Form P Sections"
            description="Review the information entered in the current LeaseFlow prototype."
          />

          <div className="review-section-list">
            {HOMEOWNER_SECTIONS.map(
              (number) => (
                <div
                  className="review-section-preview"
                  key={number}
                >
                  <div className="review-section-preview-head">
                    <span>
                      Section {number}
                    </span>

                    {sections[number]
                      ?.completed && (
                      <strong>
                        ✓ Completed
                      </strong>
                    )}
                  </div>

                  {renderSection(number)}
                </div>
              )
            )}
          </div>
        </section>

        {/* SIGNATURE STATUS */}

        <section className="review-card">
          <ReviewCardHeader
            number="03"
            title="Signature Status"
            description="Every required signing party must complete their signature."
          />

          <div className="review-signature-list">

            <SignatureRow
              name="Homeowner"
              description="Required homeowner signature"
              signed={homeownerSigned}
            />

            {tenants.map(
              (tenant) => (
                <SignatureRow
                  key={tenant.id}
                  name={tenant.name}
                  description="Tenant signature"
                  signed={hasSignature(
                    tenant.id
                  )}
                />
              )
            )}

          </div>
        </section>

        {/* HOMEOWNER SIGNATURE */}

        {!homeownerSigned && (
          <section className="review-sign-card">
            <ReviewCardHeader
              number="04"
              title="Homeowner Signature"
              description="Once the tenant invitations have been sent, upload your signature to complete the homeowner signing step."
            />

            <div className="review-sign-inner">

              <label className="review-upload-label">
                Signature image
              </label>

              <label className="review-upload">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={
                    handleSignatureUpload
                  }
                />

                <div className="review-upload-icon">
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
                      alt="Homeowner signature"
                    />
                  </div>

                </div>
              )}

              <p className="review-sign-note">
                Your signature image will be
                included in the final rental
                agreement.
              </p>

              <button
                className="primary-btn"
                disabled={
                  busy ||
                  !signature
                }
                onClick={
                  signAsHomeowner
                }
              >
                {busy
                  ? "Saving..."
                  : "Sign Agreement →"}
              </button>

            </div>
          </section>
        )}

        {/* FINAL AGREEMENT */}

        <section
          className={
            canGenerate
              ? "review-final ready"
              : "review-final"
          }
        >
          <div className="review-final-icon">
            {canGenerate
              ? "✓"
              : "○"}
          </div>

          <div className="review-final-content">

            <span className="review-eyebrow">
              FINAL DOCUMENT
            </span>

            <h2>
              Rental Agreement
            </h2>

            {canGenerate ? (
              <>
                <p>
                  All required parties have
                  signed. The completed rental
                  agreement can now be generated.
                </p>

                <button
                  className="primary-btn"
                  disabled={busy}
                  onClick={generatePdf}
                >
                  {busy
                    ? "Generating..."
                    : "Generate Rental Agreement PDF →"}
                </button>
              </>
            ) : (
              <>
                <p>
                  The final agreement will become
                  available after all required
                  signatures are collected.
                </p>

                <div className="review-checklist">

                  <div>
                    <span
                      className={
                        homeownerSigned
                          ? "check complete"
                          : "check"
                      }
                    >
                      {homeownerSigned
                        ? "✓"
                        : "○"}
                    </span>

                    Homeowner signature
                  </div>

                  <div>
                    <span
                      className={
                        allTenantsSigned
                          ? "check complete"
                          : "check"
                      }
                    >
                      {allTenantsSigned
                        ? "✓"
                        : "○"}
                    </span>

                    All tenant signatures
                  </div>

                </div>
              </>
            )}

          </div>
        </section>

        <footer className="review-footer">
          LeaseFlow · Rental Agreement Management
        </footer>

      </main>
    </div>
  );
}

function ReviewCardHeader({
  number,
  title,
  description,
}) {
  return (
    <div className="review-card-header">
      <div className="review-section-number">
        {number}
      </div>

      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

function SignatureRow({
  name,
  description,
  signed,
}) {
  return (
    <div className="review-signature-row">
      <div className="review-signature-person">

        <div
          className={
            signed
              ? "review-signature-icon signed"
              : "review-signature-icon"
          }
        >
          {signed ? "✓" : "○"}
        </div>

        <div>
          <strong>{name}</strong>

          <p>{description}</p>
        </div>

      </div>

      <span
        className={
          signed
            ? "review-signed"
            : "review-pending"
        }
      >
        {signed
          ? "Signed"
          : "Pending"}
      </span>
    </div>
  );
}