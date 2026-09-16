import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../api";

const STEPS = [
  { no: 1, title: "Parties", short: "Landlord & tenants" },
  { no: 3, title: "Premises", short: "Rental property" },
  { no: 9, title: "Service by Tenant", short: "Email for notices" },
  { no: 11, title: "Lease Type", short: "11A / 11B" },
  { no: 13, title: "Rent", short: "Rent & payment" },
  { no: 16, title: "Rent Includes", short: "Utilities & services" },
  { no: 17, title: "Additional Obligations", short: "Responsibilities" },
  { no: 18, title: "Security Deposit", short: "Deposit details" },
  { no: 19, title: "Inspection", short: "Inspection report" },
  { no: 23, title: "Tenant Notice", short: "Notice to quit" },
];

const emptyTenant = {
  name: "",
  email: "",
  dob: "",
  phone: "",
};

const initialForm = {
  // Section 1
  landlordName: "",
  landlordAddress: "",
  landlordPhone: "",
  landlordEmail: "",

  tenant1: { ...emptyTenant },
  tenant2: { ...emptyTenant },
  tenant3: { ...emptyTenant },

  // Section 3
  propertyType: "Apartment",
  address: "",
  city: "",
  province: "Nova Scotia",
  postalCode: "",
  poBox: "",
  propertyPhone: "",

  // Section 9
  tenantServiceEmail: "",

  // Section 11
  leaseType: "11A",
  startDate: "",
  endDate: "",

  // Section 13
  rentAmount: "",
  rentFrequency: "Monthly",
  rentDueDay: "",
  paymentMethod: "",
  rentIncreaseDetails: "",

  // Section 16
  heatIncluded: false,
  electricityIncluded: false,
  waterIncluded: false,
  hotWaterIncluded: false,
  appliancesIncluded: "",
  parkingIncluded: false,
  internetIncluded: false,
  otherIncluded: "",

  // Section 17
  tenantResponsibilities: "",
  landlordResponsibilities: "",
  additionalObligations: "",

  // Section 18
  securityDepositRequired: false,
  securityDepositAmount: "",
  financialInstitution: "",
  depositBranch: "",

  // Section 19
  inspectionReportAttached: false,
  inspectionNotes: "",

  // Section 23
  tenantNoticeDetails: "",
};

export default function ApplicationWizard() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const step = STEPS[stepIndex];

  const progress = Math.round(
    ((stepIndex + 1) / STEPS.length) * 100
  );

  const tenantCount = useMemo(() => {
    return [form.tenant1, form.tenant2, form.tenant3].filter(
      (tenant) => tenant.name.trim() !== ""
    ).length;
  }, [form]);

  useEffect(() => {
    loadExistingData();
  }, [id]);

  const loadExistingData = async () => {
    try {
      setLoading(true);

      const application = await api.getApplication(id);

      if (application) {
        const data = application.formData || application;

        if (data && typeof data === "object") {
          setForm((previous) => ({
            ...previous,
            ...data,
            tenant1: {
              ...previous.tenant1,
              ...(data.tenant1 || {}),
            },
            tenant2: {
              ...previous.tenant2,
              ...(data.tenant2 || {}),
            },
            tenant3: {
              ...previous.tenant3,
              ...(data.tenant3 || {}),
            },
          }));
        }
      }

      // Also load saved sections if they already exist.
      for (const sectionNo of [1, 3, 9, 11, 13, 16, 17, 18, 19, 23]) {
        try {
          const saved = await api.getSection(id, sectionNo);

          if (saved?.data) {
            setForm((previous) => ({
              ...previous,
              ...saved.data,
              tenant1: {
                ...previous.tenant1,
                ...(saved.data.tenant1 || {}),
              },
              tenant2: {
                ...previous.tenant2,
                ...(saved.data.tenant2 || {}),
              },
              tenant3: {
                ...previous.tenant3,
                ...(saved.data.tenant3 || {}),
              },
            }));
          }
        } catch {
          // Section may not exist yet. That's okay.
        }
      }
    } catch (err) {
      console.error(err);
      setError("Unable to load this application.");
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateTenant = (number, field, value) => {
    setForm((previous) => ({
      ...previous,
      [`tenant${number}`]: {
        ...previous[`tenant${number}`],
        [field]: value,
      },
    }));
  };

  const classifyTenant = (dob) => {
    if (!dob) return "";

    const birthDate = new Date(dob);
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();

    const month =
      today.getMonth() - birthDate.getMonth();

    if (
      month < 0 ||
      (month === 0 &&
        today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 18 ? "TENANT" : "OCCUPANT";
  };

  const validateCurrentStep = () => {
    setError("");

    if (step.no === 1) {
      if (!form.landlordName.trim()) {
        return "Landlord name is required.";
      }

      if (!form.landlordAddress.trim()) {
        return "Landlord address is required.";
      }

      if (!form.tenant1.name.trim()) {
        return "At least one tenant is required.";
      }

      if (!form.tenant1.email.trim()) {
        return "Tenant 1 email is required.";
      }

      if (!form.tenant1.dob) {
        return "Tenant 1 date of birth is required.";
      }

      return "";
    }

    if (step.no === 3) {
      if (!form.address.trim()) {
        return "Rental property address is required.";
      }

      if (!form.city.trim()) {
        return "City is required.";
      }

      if (!form.postalCode.trim()) {
        return "Postal code is required.";
      }

      return "";
    }

    if (step.no === 9) {
      if (!form.tenantServiceEmail.trim()) {
        return "Tenant email for service is required.";
      }

      return "";
    }

    if (step.no === 11) {
      if (!form.startDate) {
        return "Lease start date is required.";
      }

      if (
        form.leaseType === "11B" &&
        !form.endDate
      ) {
        return "Fixed-term lease end date is required.";
      }

      return "";
    }

    if (step.no === 13) {
      if (!form.rentAmount) {
        return "Rent amount is required.";
      }

      if (!form.rentFrequency) {
        return "Rent frequency is required.";
      }

      return "";
    }

    if (step.no === 18) {
      if (
        form.securityDepositRequired &&
        !form.securityDepositAmount
      ) {
        return "Enter the security deposit amount.";
      }

      if (
        form.securityDepositRequired &&
        Number(form.securityDepositAmount) >
          Number(form.rentAmount) / 2
      ) {
        return "The security deposit cannot exceed half a month's rent.";
      }

      return "";
    }

    return "";
  };

  const buildSectionData = () => {
    switch (step.no) {
      case 1:
        return {
          landlordName: form.landlordName,
          landlordAddress: form.landlordAddress,
          landlordPhone: form.landlordPhone,
          landlordEmail: form.landlordEmail,

          tenant1: form.tenant1,
          tenant2: form.tenant2,
          tenant3: form.tenant3,

          tenantCount,
        };

      case 3:
        return {
          propertyType: form.propertyType,
          address: form.address,
          city: form.city,
          province: form.province,
          postalCode: form.postalCode,
          poBox: form.poBox,
          propertyPhone: form.propertyPhone,
        };

      case 9:
        return {
          tenantServiceEmail: form.tenantServiceEmail,
        };

      case 11:
        return {
          leaseType: form.leaseType,
          startDate: form.startDate,
          endDate:
            form.leaseType === "11B"
              ? form.endDate
              : "",
        };

      case 13:
        return {
          rentAmount: form.rentAmount,
          rentFrequency: form.rentFrequency,
          rentDueDay: form.rentDueDay,
          paymentMethod: form.paymentMethod,
          rentIncreaseDetails:
            form.rentIncreaseDetails,
        };

      case 16:
        return {
          heatIncluded: form.heatIncluded,
          electricityIncluded:
            form.electricityIncluded,
          waterIncluded: form.waterIncluded,
          hotWaterIncluded:
            form.hotWaterIncluded,
          appliancesIncluded:
            form.appliancesIncluded,
          parkingIncluded:
            form.parkingIncluded,
          internetIncluded:
            form.internetIncluded,
          otherIncluded: form.otherIncluded,
        };

      case 17:
        return {
          tenantResponsibilities:
            form.tenantResponsibilities,
          landlordResponsibilities:
            form.landlordResponsibilities,
          additionalObligations:
            form.additionalObligations,
        };

      case 18:
        return {
          securityDepositRequired:
            form.securityDepositRequired,
          securityDepositAmount:
            form.securityDepositAmount,
          financialInstitution:
            form.financialInstitution,
          depositBranch:
            form.depositBranch,
        };

      case 19:
        return {
          inspectionReportAttached:
            form.inspectionReportAttached,
          inspectionNotes:
            form.inspectionNotes,
        };

      case 23:
        return {
          tenantNoticeDetails:
            form.tenantNoticeDetails,
        };

      default:
        return {};
    }
  };

  const saveCurrentStep = async () => {
    const validationError =
      validateCurrentStep();

    if (validationError) {
      setError(validationError);
      return false;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const data = buildSectionData();

      await api.saveSection(
        id,
        step.no,
        data,
        true
      );

      /*
       * Section 1 also creates/updates the actual
       * application parties in the backend.
       */
      if (step.no === 1) {
        const existingParties =
          await api.getParties(id);

        const parties =
          existingParties || [];

        const tenants = [
          form.tenant1,
          form.tenant2,
          form.tenant3,
        ].filter(
          (tenant) =>
            tenant.name.trim() !== ""
        );

        for (let index = 0; index < tenants.length; index++) {
          const tenant = tenants[index];

          const partyData = {
            name: tenant.name,
            email: tenant.email,
            phone: tenant.phone,
            dateOfBirth: tenant.dob,
            type: classifyTenant(tenant.dob),
          };

          const existing =
            parties[index];

          if (existing?.id) {
            await api.updateParty(
              id,
              existing.id,
              partyData
            );
          } else {
            await api.addParty(
              id,
              partyData
            );
          }
        }
      }

      setSuccess(
        `Section ${step.no} saved successfully.`
      );

      return true;
    } catch (err) {
      console.error(err);
      setError(
        err?.message ||
          "Could not save this section."
      );
      return false;
    } finally {
      setSaving(false);
    }
  };

  const nextStep = async () => {
    const saved = await saveCurrentStep();

    if (!saved) return;

    if (stepIndex < STEPS.length - 1) {
      setStepIndex((previous) => previous + 1);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } else {
      await finishApplication();
    }
  };

  const previousStep = () => {
    setError("");
    setSuccess("");

    if (stepIndex > 0) {
      setStepIndex((previous) => previous - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  const goToStep = async (index) => {
    if (index > stepIndex) {
      const saved = await saveCurrentStep();

      if (!saved) return;
    }

    setError("");
    setSuccess("");
    setStepIndex(index);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const finishApplication = async () => {
    try {
      setSaving(true);

      await api.updateApplicationStatus(
        id,
        "HOMEOWNER_COMPLETED"
      );

      setSuccess(
        "Application completed successfully."
      );

      setTimeout(() => {
        navigate(`/review/${id}`);
      }, 600);
    } catch (err) {
      console.error(err);

      setError(
        err?.message ||
          "Application was saved, but the status could not be updated."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-center">
        <div className="loading-card">
          <div className="spinner"></div>
          <p>Loading application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="wizard-page">
      <div className="wizard-shell">

        {/* SIDEBAR */}
        <aside className="wizard-sidebar">

          <div className="wizard-brand">
            <div className="brand-mark">
              LF
            </div>

            <div>
              <strong>LeaseFlow</strong>
              <span>Rental Agreement</span>
            </div>
          </div>

          <div className="wizard-progress-box">
            <div className="progress-top">
              <span>Application progress</span>
              <strong>{progress}%</strong>
            </div>

            <div className="progress-track">
              <div
                className="progress-fill"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
          </div>

          <div className="wizard-steps">
            {STEPS.map((item, index) => {
              const active =
                index === stepIndex;

              const completed =
                index < stepIndex;

              return (
                <button
                  key={item.no}
                  className={`wizard-step ${
                    active ? "active" : ""
                  } ${
                    completed ? "completed" : ""
                  }`}
                  onClick={() =>
                    goToStep(index)
                  }
                >
                  <span className="step-number">
                    {completed
                      ? "✓"
                      : item.no}
                  </span>

                  <span className="step-text">
                    <strong>
                      Section {item.no}
                    </strong>

                    <small>
                      {item.title}
                    </small>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="wizard-sidebar-footer">
            <span className="status-dot"></span>

            <div>
              <strong>Draft saved securely</strong>
              <small>
                Your information is saved as
                you progress.
              </small>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className="wizard-main">

          <header className="wizard-header">
            <div>
              <span className="eyebrow">
                NOVA SCOTIA • FORM P
              </span>

              <h1>
                {step.title}
              </h1>

              <p>
                {step.short}
              </p>
            </div>

            <div className="header-meta">
              <span>
                Section {step.no}
              </span>

              <strong>
                {stepIndex + 1} / {STEPS.length}
              </strong>
            </div>
          </header>

          {error && (
            <div className="wizard-alert error">
              <strong>Check this section</strong>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="wizard-alert success">
              <strong>Saved</strong>
              <span>{success}</span>
            </div>
          )}

          <section className="wizard-card">

            {/* SECTION 1 */}
            {step.no === 1 && (
              <>
                <SectionIntro
                  number="01"
                  title="Parties"
                  text="Enter the landlord and tenant information that will appear on the rental agreement."
                />

                <FormSection title="Landlord">
                  <div className="form-grid">
                    <Input
                      label="Landlord / legal name"
                      value={form.landlordName}
                      onChange={(e) =>
                        updateField(
                          "landlordName",
                          e.target.value
                        )
                      }
                      required
                    />

                    <Input
                      label="Phone"
                      value={form.landlordPhone}
                      onChange={(e) =>
                        updateField(
                          "landlordPhone",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      label="Email"
                      type="email"
                      value={form.landlordEmail}
                      onChange={(e) =>
                        updateField(
                          "landlordEmail",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      label="Address"
                      value={form.landlordAddress}
                      onChange={(e) =>
                        updateField(
                          "landlordAddress",
                          e.target.value
                        )
                      }
                      required
                      full
                    />
                  </div>
                </FormSection>

                <FormSection
                  title="Tenant information"
                  description="Add up to three tenants. Age is used by LeaseFlow to classify the person as a tenant or occupant."
                >
                  {[1, 2, 3].map((number) => {
                    const tenant =
                      form[`tenant${number}`];

                    const classification =
                      classifyTenant(
                        tenant.dob
                      );

                    return (
                      <div
                        className="tenant-entry"
                        key={number}
                      >
                        <div className="tenant-entry-head">
                          <div>
                            <strong>
                              Tenant {number}
                            </strong>

                            {number === 1 && (
                              <span className="required-pill">
                                Required
                              </span>
                            )}
                          </div>

                          {classification && (
                            <span
                              className={`classification ${classification.toLowerCase()}`}
                            >
                              {classification}
                            </span>
                          )}
                        </div>

                        <div className="form-grid">
                          <Input
                            label="Full name"
                            value={tenant.name}
                            onChange={(e) =>
                              updateTenant(
                                number,
                                "name",
                                e.target.value
                              )
                            }
                            required={
                              number === 1
                            }
                          />

                          <Input
                            label="Email"
                            type="email"
                            value={tenant.email}
                            onChange={(e) =>
                              updateTenant(
                                number,
                                "email",
                                e.target.value
                              )
                            }
                            required={
                              number === 1
                            }
                          />

                          <Input
                            label="Date of birth"
                            type="date"
                            value={tenant.dob}
                            onChange={(e) =>
                              updateTenant(
                                number,
                                "dob",
                                e.target.value
                              )
                            }
                            required={
                              number === 1
                            }
                          />

                          <Input
                            label="Phone"
                            value={tenant.phone}
                            onChange={(e) =>
                              updateTenant(
                                number,
                                "phone",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  })}
                </FormSection>
              </>
            )}

            {/* SECTION 3 */}
            {step.no === 3 && (
              <>
                <SectionIntro
                  number="03"
                  title="Premises"
                  text="Provide the complete civic address and basic property details."
                />

                <FormSection title="Rental property">
                  <div className="form-grid">
                    <Select
                      label="Type of property"
                      value={form.propertyType}
                      onChange={(e) =>
                        updateField(
                          "propertyType",
                          e.target.value
                        )
                      }
                      options={[
                        "Apartment",
                        "House",
                        "Room",
                        "Basement Suite",
                        "Condominium",
                        "Manufactured Home Space",
                        "Other",
                      ]}
                    />

                    <Input
                      label="Property phone"
                      value={form.propertyPhone}
                      onChange={(e) =>
                        updateField(
                          "propertyPhone",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      label="Civic address"
                      value={form.address}
                      onChange={(e) =>
                        updateField(
                          "address",
                          e.target.value
                        )
                      }
                      required
                      full
                    />

                    <Input
                      label="City / municipality"
                      value={form.city}
                      onChange={(e) =>
                        updateField(
                          "city",
                          e.target.value
                        )
                      }
                      required
                    />

                    <Input
                      label="Province"
                      value={form.province}
                      onChange={(e) =>
                        updateField(
                          "province",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      label="Postal code"
                      value={form.postalCode}
                      onChange={(e) =>
                        updateField(
                          "postalCode",
                          e.target.value
                        )
                      }
                      required
                    />

                    <Input
                      label="P.O. Box"
                      value={form.poBox}
                      onChange={(e) =>
                        updateField(
                          "poBox",
                          e.target.value
                        )
                      }
                    />
                  </div>
                </FormSection>
              </>
            )}

            {/* SECTION 9 */}
            {step.no === 9 && (
              <>
                <SectionIntro
                  number="09"
                  title="Service by Tenant"
                  text="Enter the tenant's electronic address for service of residential tenancy documents."
                />

                <FormSection title="Electronic address for service">
                  <div className="info-box">
                    <span className="info-icon">
                      @
                    </span>

                    <div>
                      <strong>
                        Email service
                      </strong>

                      <p>
                        For a new lease, the
                        tenant and landlord may
                        use the email addresses
                        provided in the lease for
                        serving tenancy documents.
                      </p>
                    </div>
                  </div>

                  <div className="form-grid">
                    <Input
                      label="Tenant email address"
                      type="email"
                      value={
                        form.tenantServiceEmail
                      }
                      onChange={(e) =>
                        updateField(
                          "tenantServiceEmail",
                          e.target.value
                        )
                      }
                      required
                      full
                    />
                  </div>
                </FormSection>
              </>
            )}

            {/* SECTION 11 */}
            {step.no === 11 && (
              <>
                <SectionIntro
                  number="11"
                  title="Lease Type"
                  text="Choose whether this is a periodic tenancy or a fixed-term tenancy."
                />

                <FormSection title="Select lease type">
                  <div className="lease-type-grid">

                    <button
                      type="button"
                      className={`lease-option ${
                        form.leaseType === "11A"
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        updateField(
                          "leaseType",
                          "11A"
                        )
                      }
                    >
                      <span className="option-radio">
                        {form.leaseType ===
                        "11A"
                          ? "✓"
                          : ""}
                      </span>

                      <div>
                        <strong>
                          11A — Periodic
                          Tenancy
                        </strong>

                        <p>
                          The tenancy continues
                          according to its
                          periodic term.
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`lease-option ${
                        form.leaseType === "11B"
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        updateField(
                          "leaseType",
                          "11B"
                        )
                      }
                    >
                      <span className="option-radio">
                        {form.leaseType ===
                        "11B"
                          ? "✓"
                          : ""}
                      </span>

                      <div>
                        <strong>
                          11B — Fixed Term
                        </strong>

                        <p>
                          The tenancy has a
                          specified beginning
                          and ending date.
                        </p>
                      </div>
                    </button>

                  </div>
                </FormSection>

                <FormSection title="Lease dates">
                  <div className="form-grid">
                    <Input
                      label="Start date"
                      type="date"
                      value={form.startDate}
                      onChange={(e) =>
                        updateField(
                          "startDate",
                          e.target.value
                        )
                      }
                      required
                    />

                    {form.leaseType ===
                      "11B" && (
                      <Input
                        label="End date"
                        type="date"
                        value={form.endDate}
                        onChange={(e) =>
                          updateField(
                            "endDate",
                            e.target.value
                          )
                        }
                        required
                      />
                    )}
                  </div>
                </FormSection>
              </>
            )}

            {/* SECTION 13 */}
            {step.no === 13 && (
              <>
                <SectionIntro
                  number="13"
                  title="Rent"
                  text="Enter the agreed rent amount and payment arrangement."
                />

                <FormSection title="Rent details">
                  <div className="form-grid">
                    <Input
                      label="Rent amount"
                      type="number"
                      min="0"
                      step="0.01"
                      prefix="$"
                      value={form.rentAmount}
                      onChange={(e) =>
                        updateField(
                          "rentAmount",
                          e.target.value
                        )
                      }
                      required
                    />

                    <Select
                      label="Rent frequency"
                      value={form.rentFrequency}
                      onChange={(e) =>
                        updateField(
                          "rentFrequency",
                          e.target.value
                        )
                      }
                      options={[
                        "Weekly",
                        "Bi-weekly",
                        "Monthly",
                        "Yearly",
                      ]}
                    />

                    <Input
                      label="Rent due day"
                      placeholder="e.g. 1st of each month"
                      value={form.rentDueDay}
                      onChange={(e) =>
                        updateField(
                          "rentDueDay",
                          e.target.value
                        )
                      }
                    />

                    <Input
                      label="Payment method"
                      placeholder="e.g. E-transfer"
                      value={form.paymentMethod}
                      onChange={(e) =>
                        updateField(
                          "paymentMethod",
                          e.target.value
                        )
                      }
                    />

                    <TextArea
                      label="Rent increase details"
                      placeholder="Add any relevant details..."
                      value={
                        form.rentIncreaseDetails
                      }
                      onChange={(e) =>
                        updateField(
                          "rentIncreaseDetails",
                          e.target.value
                        )
                      }
                      full
                    />
                  </div>
                </FormSection>
              </>
            )}

            {/* SECTION 16 */}
            {step.no === 16 && (
              <>
                <SectionIntro
                  number="16"
                  title="Rent Includes"
                  text="Select the appliances, utilities and services included in the rent."
                />

                <FormSection title="Included items">
                  <div className="checkbox-grid">

                    <CheckBox
                      label="Heat"
                      checked={
                        form.heatIncluded
                      }
                      onChange={(value) =>
                        updateField(
                          "heatIncluded",
                          value
                        )
                      }
                    />

                    <CheckBox
                      label="Electricity"
                      checked={
                        form.electricityIncluded
                      }
                      onChange={(value) =>
                        updateField(
                          "electricityIncluded",
                          value
                        )
                      }
                    />

                    <CheckBox
                      label="Water"
                      checked={
                        form.waterIncluded
                      }
                      onChange={(value) =>
                        updateField(
                          "waterIncluded",
                          value
                        )
                      }
                    />

                    <CheckBox
                      label="Hot water"
                      checked={
                        form.hotWaterIncluded
                      }
                      onChange={(value) =>
                        updateField(
                          "hotWaterIncluded",
                          value
                        )
                      }
                    />

                    <CheckBox
                      label="Parking"
                      checked={
                        form.parkingIncluded
                      }
                      onChange={(value) =>
                        updateField(
                          "parkingIncluded",
                          value
                        )
                      }
                    />

                    <CheckBox
                      label="Internet"
                      checked={
                        form.internetIncluded
                      }
                      onChange={(value) =>
                        updateField(
                          "internetIncluded",
                          value
                        )
                      }
                    />
                  </div>

                  <div className="form-grid">
                    <Input
                      label="Appliances included"
                      placeholder="e.g. Refrigerator, stove, washer"
                      value={
                        form.appliancesIncluded
                      }
                      onChange={(e) =>
                        updateField(
                          "appliancesIncluded",
                          e.target.value
                        )
                      }
                      full
                    />

                    <TextArea
                      label="Other items included"
                      placeholder="Describe anything else included in rent..."
                      value={
                        form.otherIncluded
                      }
                      onChange={(e) =>
                        updateField(
                          "otherIncluded",
                          e.target.value
                        )
                      }
                      full
                    />
                  </div>
                </FormSection>
              </>
            )}

            {/* SECTION 17 */}
            {step.no === 17 && (
              <>
                <SectionIntro
                  number="17"
                  title="Additional Obligations"
                  text="Record any agreed responsibilities that form part of the rental arrangement."
                />

                <FormSection title="Responsibilities">
                  <div className="form-grid">

                    <TextArea
                      label="Tenant responsibilities"
                      placeholder="e.g. Snow removal, lawn maintenance..."
                      value={
                        form.tenantResponsibilities
                      }
                      onChange={(e) =>
                        updateField(
                          "tenantResponsibilities",
                          e.target.value
                        )
                      }
                      full
                    />

                    <TextArea
                      label="Landlord responsibilities"
                      placeholder="Add landlord responsibilities..."
                      value={
                        form.landlordResponsibilities
                      }
                      onChange={(e) =>
                        updateField(
                          "landlordResponsibilities",
                          e.target.value
                        )
                      }
                      full
                    />

                    <TextArea
                      label="Additional obligations"
                      placeholder="Add any additional agreed obligations..."
                      value={
                        form.additionalObligations
                      }
                      onChange={(e) =>
                        updateField(
                          "additionalObligations",
                          e.target.value
                        )
                      }
                      full
                    />

                  </div>
                </FormSection>
              </>
            )}

            {/* SECTION 18 */}
            {step.no === 18 && (
              <>
                <SectionIntro
                  number="18"
                  title="Security Deposit"
                  text="Record whether a security deposit is required and, if applicable, where it will be held."
                />

                <FormSection title="Deposit">
                  <div className="deposit-choice">

                    <button
                      type="button"
                      className={`deposit-option ${
                        !form.securityDepositRequired
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        updateField(
                          "securityDepositRequired",
                          false
                        )
                      }
                    >
                      <span>
                        {!form.securityDepositRequired
                          ? "✓"
                          : ""}
                      </span>

                      <div>
                        <strong>
                          No security deposit
                        </strong>

                        <small>
                          No deposit is required.
                        </small>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`deposit-option ${
                        form.securityDepositRequired
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        updateField(
                          "securityDepositRequired",
                          true
                        )
                      }
                    >
                      <span>
                        {form.securityDepositRequired
                          ? "✓"
                          : ""}
                      </span>

                      <div>
                        <strong>
                          Security deposit
                        </strong>

                        <small>
                          Maximum: ½ month's rent.
                        </small>
                      </div>
                    </button>

                  </div>

                  {form.securityDepositRequired && (
                    <div className="form-grid deposit-fields">
                      <Input
                        label="Deposit amount"
                        type="number"
                        min="0"
                        step="0.01"
                        prefix="$"
                        value={
                          form.securityDepositAmount
                        }
                        onChange={(e) =>
                          updateField(
                            "securityDepositAmount",
                            e.target.value
                          )
                        }
                        required
                      />

                      <Input
                        label="Financial institution / branch"
                        value={
                          form.financialInstitution
                        }
                        onChange={(e) =>
                          updateField(
                            "financialInstitution",
                            e.target.value
                          )
                        }
                      />

                      <Input
                        label="Branch"
                        value={
                          form.depositBranch
                        }
                        onChange={(e) =>
                          updateField(
                            "depositBranch",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  )}

                  {form.securityDepositRequired &&
                    form.rentAmount && (
                      <div className="limit-note">
                        Maximum permitted deposit:
                        <strong>
                          {" "}
                          $
                          {(
                            Number(
                              form.rentAmount
                            ) / 2
                          ).toFixed(2)}
                        </strong>
                      </div>
                    )}
                </FormSection>
              </>
            )}

            {/* SECTION 19 */}
            {step.no === 19 && (
              <>
                <SectionIntro
                  number="19"
                  title="Inspection"
                  text="Record whether a written inspection report will form part of the lease."
                />

                <FormSection title="Inspection report">
                  <div className="inspection-choice">

                    <button
                      type="button"
                      className={`inspection-option ${
                        form.inspectionReportAttached
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        updateField(
                          "inspectionReportAttached",
                          true
                        )
                      }
                    >
                      <span>
                        {form.inspectionReportAttached
                          ? "✓"
                          : ""}
                      </span>

                      <div>
                        <strong>
                          Inspection report attached
                        </strong>

                        <small>
                          A written report will
                          form part of the lease.
                        </small>
                      </div>
                    </button>

                    <button
                      type="button"
                      className={`inspection-option ${
                        !form.inspectionReportAttached
                          ? "selected"
                          : ""
                      }`}
                      onClick={() =>
                        updateField(
                          "inspectionReportAttached",
                          false
                        )
                      }
                    >
                      <span>
                        {!form.inspectionReportAttached
                          ? "✓"
                          : ""}
                      </span>

                      <div>
                        <strong>
                          No inspection report attached
                        </strong>

                        <small>
                          No report is attached at
                          this stage.
                        </small>
                      </div>
                    </button>

                  </div>

                  <TextArea
                    label="Inspection notes"
                    placeholder="Optional notes about the inspection..."
                    value={
                      form.inspectionNotes
                    }
                    onChange={(e) =>
                      updateField(
                        "inspectionNotes",
                        e.target.value
                      )
                    }
                  />
                </FormSection>
              </>
            )}

            {/* SECTION 23 */}
            {step.no === 23 && (
              <>
                <SectionIntro
                  number="23"
                  title="Tenant Notice to Quit"
                  text="Record any information needed for the tenant notice provisions of the lease."
                />

                <FormSection title="Tenant notice details">
                  <div className="info-box">
                    <span className="info-icon">
                      i
                    </span>

                    <div>
                      <strong>
                        Notice provisions
                      </strong>

                      <p>
                        The applicable statutory
                        requirements continue to
                        apply to the tenancy.
                        Use this field for
                        agreement-specific
                        information only.
                      </p>
                    </div>
                  </div>

                  <TextArea
                    label="Additional information"
                    placeholder="Enter any agreement-specific information..."
                    value={
                      form.tenantNoticeDetails
                    }
                    onChange={(e) =>
                      updateField(
                        "tenantNoticeDetails",
                        e.target.value
                      )
                    }
                    full
                  />
                </FormSection>

                <div className="completion-card">
                  <div className="completion-icon">
                    ✓
                  </div>

                  <div>
                    <strong>
                      Ready for review
                    </strong>

                    <p>
                      You've completed the
                      LeaseFlow sections required
                      for this prototype.
                    </p>
                  </div>
                </div>
              </>
            )}

          </section>

          {/* BOTTOM NAVIGATION */}
          <footer className="wizard-footer">

            <button
              className="btn secondary"
              onClick={previousStep}
              disabled={
                stepIndex === 0 || saving
              }
            >
              ← Previous
            </button>

            <div className="footer-center">
              <span>
                Section {step.no} of{" "}
                {STEPS.length}
              </span>

              <strong>
                {tenantCount}{" "}
                {tenantCount === 1
                  ? "tenant"
                  : "tenants"}{" "}
                added
              </strong>
            </div>

            <button
              className="btn primary"
              onClick={nextStep}
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : stepIndex ===
                  STEPS.length - 1
                ? "Complete Application →"
                : "Save & Continue →"}
            </button>

          </footer>

        </main>
      </div>
    </div>
  );
}

/* =========================
   SMALL COMPONENTS
========================= */

function SectionIntro({
  number,
  title,
  text,
}) {
  return (
    <div className="section-intro">
      <span className="section-number">
        {number}
      </span>

      <div>
        <h2>{title}</h2>
        <p>{text}</p>
      </div>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}) {
  return (
    <div className="form-section">
      <div className="form-section-heading">
        <h3>{title}</h3>

        {description && (
          <p>{description}</p>
        )}
      </div>

      {children}
    </div>
  );
}

function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required = false,
  full = false,
  prefix,
  min,
  step,
}) {
  return (
    <label
      className={`field ${
        full ? "field-full" : ""
      }`}
    >
      <span>
        {label}
        {required && (
          <b className="required">*</b>
        )}
      </span>

      <div className="input-wrap">
        {prefix && (
          <span className="input-prefix">
            {prefix}
          </span>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          min={min}
          step={step}
        />
      </div>
    </label>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  full = false,
}) {
  return (
    <label
      className={`field ${
        full ? "field-full" : ""
      }`}
    >
      <span>{label}</span>

      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={4}
      />
    </label>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}) {
  return (
    <label className="field">
      <span>{label}</span>

      <select
        value={value}
        onChange={onChange}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function CheckBox({
  label,
  checked,
  onChange,
}) {
  return (
    <label
      className={`checkbox-card ${
        checked ? "checked" : ""
      }`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(e.target.checked)
        }
      />

      <span className="custom-check">
        {checked ? "✓" : ""}
      </span>

      <strong>{label}</strong>
    </label>
  );
}
