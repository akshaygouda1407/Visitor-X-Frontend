import React, { useState } from "react";
import "./global.css";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://visitorx.onrender.com";

// Change these 2 endpoints if your backend Swagger has different names
const GENERATE_QR_API = `${BASE_URL}/api/visitor/qr/generate`;
const VERIFY_QR_API = `${BASE_URL}/api/visitor/qr/verify`;

export default function QRScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [qrImage, setQrImage] = useState("");
  const [loadingQr, setLoadingQr] = useState(false);
  const [error, setError] = useState("");

  const generateQrFromBackend = async () => {
    try {
      setLoadingQr(true);
      setError("");

      const response = await fetch(GENERATE_QR_API, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("Failed to generate QR code");
      }

      const data = await response.json();

      // Backend can return: qrCodeUrl / qrImage / qrCode / imageUrl
      const qr =
        data.qrCodeUrl ||
        data.qrImage ||
        data.qrCode ||
        data.imageUrl ||
        "";

      if (!qr) {
        throw new Error("QR image not found in backend response");
      }

      setQrImage(qr);
    } catch (err) {
      setError(err.message || "Something went wrong while generating QR");
    } finally {
      setLoadingQr(false);
    }
  };

  const verifyQrFromBackend = async () => {
    try {
      setIsScanning(true);
      setError("");

      const response = await fetch(VERIFY_QR_API, {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error("QR verification failed");
      }

      const data = await response.json();

      setScanResult({
        name: data.name || data.visitorName || "Unknown Visitor",
        phone: data.phone || data.mobileNumber || "Not Available",
        purpose: data.purpose || data.purposeOfVisit || "Not Available",
        time:
          data.time ||
          data.visitDateTime ||
          new Date().toLocaleString("en-IN"),
      });
    } catch (err) {
      setError(err.message || "Something went wrong while verifying QR");
    } finally {
      setIsScanning(false);
    }
  };

  const toggleScanner = () => {
    if (isScanning) {
      setIsScanning(false);
      return;
    }

    verifyQrFromBackend();
  };

  const clearResult = () => {
    setScanResult(null);
    setError("");
  };

  return (
    <div className="scanner-page-container">
      <div className="table-card" style={{ marginBottom: "24px" }}>
        <div className="scanner-header-block">
          <h2>📱 QR Code Verification Terminal</h2>
          <p>Scan visitor confirmation passes using your device's camera portal.</p>
        </div>
      </div>

      <div className="scanner-workspace-layout">
        <div className="table-card scanner-box-card">
          <h3>Camera Viewport</h3>

          <div className={`camera-view-window ${isScanning ? "active-scanning" : ""}`}>
            {isScanning ? (
              <div className="scanner-laser-line-wrapper">
                <div className="scanning-laser-line" />
                <span className="camera-icon-placeholder">🎥</span>
                <p>Initializing lens... Align QR pass inside the frame</p>
              </div>
            ) : qrImage ? (
              <div className="scanner-idle-state">
                <img
                  src={qrImage}
                  alt="Generated QR Code"
                  style={{
                    width: "180px",
                    height: "180px",
                    objectFit: "contain",
                    marginBottom: "12px",
                  }}
                />
                <p>QR code generated from backend</p>
              </div>
            ) : (
              <div className="scanner-idle-state">
                <span className="camera-icon-placeholder">📷</span>
                <p>Camera feed is currently offline</p>
              </div>
            )}
          </div>

          {error && (
            <p style={{ color: "red", marginTop: "10px", textAlign: "center" }}>
              {error}
            </p>
          )}

          <button
            onClick={generateQrFromBackend}
            className="add-btn scanner-toggle-trigger"
            disabled={loadingQr}
          >
            {loadingQr ? "⏳ Generating QR..." : "🔳 Generate QR From Backend"}
          </button>

          <button
            onClick={toggleScanner}
            className={`add-btn scanner-toggle-trigger ${
              isScanning ? "scanning-stop-btn" : ""
            }`}
          >
            {isScanning ? "🛑 Disconnect Camera" : "✨ Activate Device Camera"}
          </button>
        </div>

        <div className="table-card scanner-box-card">
          <h3>Verification Log Output</h3>

          {scanResult ? (
            <div className="scan-result-success-box">
              <div className="success-badge-title">✅ Pass Verified Successfully</div>

              <div className="result-data-list">
                <div className="result-data-row">
                  <span className="row-label">Visitor Name:</span>
                  <span className="row-value-highlight">{scanResult.name}</span>
                </div>

                <div className="result-data-row">
                  <span className="row-label">Mobile Number:</span>
                  <span className="row-value">{scanResult.phone}</span>
                </div>

                <div className="result-data-row">
                  <span className="row-label">Purpose:</span>
                  <span className="badge-purpose interview" style={{ marginTop: "4px" }}>
                    {scanResult.purpose}
                  </span>
                </div>

                <div className="result-data-row">
                  <span className="row-label">Timestamp:</span>
                  <span className="row-value" style={{ color: "#64748b" }}>
                    {scanResult.time}
                  </span>
                </div>
              </div>

              <button onClick={clearResult} className="export-btn clear-scan-btn">
                🔄 Clear and Scan Next Pass
              </button>
            </div>
          ) : (
            <div className="scanner-results-empty">
              <span className="empty-state-icon">📄</span>
              <p>Awaiting valid entry matrix transmission data pass...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}