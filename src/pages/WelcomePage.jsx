import { useNavigate } from "react-router-dom";

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://visitorx.onrender.com";

export default function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div className="v-container">
      <div className="v-card dark-theme-card">
        <div
          className="v-logo welcome-logo"
          onClick={() => navigate("/admin")}
        >
          Visitor<span>X</span>
        </div>

        <div className="welcome-lead">
          <h2>Welcome to Our Office</h2>
          <p>Scan the QR code to register your visit</p>
        </div>

        <div className="welcome-qr-container">
          <img
            src={`${BASE_URL}/api/qr/register`}
            alt="QR Code"
            onError={(e) => {
              e.currentTarget.src =
                "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://visitorx-app-production.up.railway.app/register";
            }}
          />
        </div>

        <div className="v-footer-action" style={{ padding: 0 }}>
          <button className="primary-btn" onClick={() => navigate("/register")}>
            Register Manually →
          </button>
        </div>

        <div
          className="welcome-footer-tag"
          style={{ cursor: "pointer" }}
          onClick={() => navigate("/admin")}
        >
          Go to Admin Dashboard Panel
        </div>
      </div>
    </div>
  );
}