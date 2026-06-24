const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://visitor-x-backend.onrender.com";

async function handleResponse(response, errorMessage) {
  const text = await response.text();

  if (!response.ok) {
    throw new Error(text || `${errorMessage}: ${response.status}`);
  }

  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function getAdminAuthHeaders() {
  const token = sessionStorage.getItem("adminToken");

  return {
    Authorization: `Bearer ${token}`,
  };
}

function formatPurposeOfVisit(purpose) {
  if (!purpose) return "";

  return purpose
    .toString()
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

export async function adminLogin(loginData) {
  const response = await fetch(`${BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username: loginData.username,
      password: loginData.password,
    }),
  });

  return handleResponse(response, "Admin login failed");
}

export async function adminLogout() {
  const response = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: getAdminAuthHeaders(),
  });

  sessionStorage.removeItem("adminToken");
  sessionStorage.removeItem("adminLoginTime");

  return handleResponse(response, "Admin logout failed");
}

export async function getAllVisitors() {
  const response = await fetch(
    `${BASE_URL}/api/admin/visitors`,
    {
      method: "GET",
      headers: getAdminAuthHeaders(),
    }
  );

  const data = await handleResponse(response, "Failed to fetch visitor data");

  return Array.isArray(data) ? data : data.content || [];
}

export async function deleteVisitorByAdmin(id) {
  const response = await fetch(`${BASE_URL}/api/admin/visitors/${id}`, {
    method: "DELETE",
    headers: getAdminAuthHeaders(),
  });

  return handleResponse(response, "Failed to delete visitor");
}

export async function registerVisitor(visitorData) {
  const photoBase64 = visitorData.photoBase64 || visitorData.photo || "";
  const purpose = visitorData.purpose || visitorData.purposeOfVisit;

  const payload = {
    name: visitorData.name?.trim(),
    mobileNumber: visitorData.phone || visitorData.mobileNumber,
    email: visitorData.email?.trim(),
    purposeOfVisit: formatPurposeOfVisit(purpose),
    photoBase64: photoBase64,
  };

  console.log("REGISTER PAYLOAD:", payload);
  console.log("PHOTO LENGTH:", photoBase64.length);

  const response = await fetch(`${BASE_URL}/api/visitor/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return handleResponse(response, "Failed to register visitor");
}
export async function updateVisitor(visitorId, visitorData) {
  const token = sessionStorage.getItem("adminToken");

  const response = await fetch(`${BASE_URL}/api/admin/visitors/${visitorId}`,
     {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(visitorData),
  });

  if (!response.ok) {
    throw new Error("Visitor update failed");
  }

  return await response.json();
}
