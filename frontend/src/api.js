const API_BASE = `${import.meta.env.VITE_API_URL}/api`;

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const text = await response.text();

  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message ||
          data?.error ||
          `Request failed (${response.status})`;

    throw new Error(message);
  }

  return data;
}

export const api = {

  register: (body) =>
    request("/users/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body) =>
    request("/users/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  createApplication: (homeownerId) =>
    request("/applications", {
      method: "POST",
      body: JSON.stringify({
        homeownerId,
      }),
    }),

  getApplication: (applicationId) =>
    request(
      `/applications/${applicationId}`
    ),

  updateApplicationStatus: (
    applicationId,
    status
  ) =>
    request(
      `/applications/${applicationId}/status?status=${encodeURIComponent(
        status
      )}`,
      {
        method: "PUT",
      }
    ),

  addParty: (
    applicationId,
    body
  ) =>
    request(
      `/applications/${applicationId}/parties`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    ),

  getParties: (
    applicationId
  ) =>
    request(
      `/applications/${applicationId}/parties`
    ),

  updateParty: (
    applicationId,
    partyId,
    body
  ) =>
    request(
      `/applications/${applicationId}/parties/${partyId}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      }
    ),

  saveSection: (
    applicationId,
    sectionNumber,
    data,
    completed = true
  ) =>
    request(
      `/applications/${applicationId}/sections/${sectionNumber}?completed=${completed}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    ),

  getSection: (
    applicationId,
    sectionNumber
  ) =>
    request(
      `/applications/${applicationId}/sections/${sectionNumber}`
    ),

  createInvitation: (
    applicationId,
    body
  ) =>
    request(
      `/applications/${applicationId}/invitations`,
      {
        method: "POST",
        body: JSON.stringify(body),
      }
    ),

  getTenantApplication: (
    token
  ) =>
    request(
      `/tenant/application/${token}`
    ),

  completeTenantApplication: (
    token
  ) =>
    request(
      `/tenant/application/${token}/complete`,
      {
        method: "POST",
      }
    ),

  saveSignature: (
    applicationId,
    partyId,
    signatureData,
    signerType
  ) =>
    request(
      `/applications/${applicationId}/signatures`,
      {
        method: "POST",
        body: JSON.stringify({
          partyId,
          signatureData,
          signerType,
        }),
      }
    ),

  getSignatures: (
    applicationId
  ) =>
    request(
      `/applications/${applicationId}/signatures`
    ),

  getSignature: (
    applicationId,
    partyId
  ) =>
    request(
      `/applications/${applicationId}/signatures/${partyId}`
    ),

  getSignaturesByType: (
    applicationId,
    signerType
  ) =>
    request(
      `/applications/${applicationId}/signatures/type/${signerType}`
    ),
};