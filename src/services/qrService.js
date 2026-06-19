const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://visitorx.onrender.com";

// Generate QR from backend
export async function generateQrCode(visitorId) {
  const response = await fetch(`${BASE_URL}/api/visitor/${visitorId}/qr`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to generate QR code");
  }

  return await response.json();
}

// Verify QR from backend
export async function verifyQrCode(qrData) {
  const response = await fetch(`${BASE_URL}/api/visitor/qr/verify`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ qrData }),
  });

  if (!response.ok) {
    throw new Error("Failed to verify QR code");
  }

  return await response.json();
}