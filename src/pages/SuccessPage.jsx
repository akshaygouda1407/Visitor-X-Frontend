import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function SuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [visitor, setVisitor] = useState(null);

  useEffect(() => {
    const visitorFromState = location.state?.visitorDetails;
    const visitorFromStorage = localStorage.getItem("visitorData");

    if (visitorFromState) {
      setVisitor(visitorFromState);
      localStorage.setItem("visitorData", JSON.stringify(visitorFromState));
      return;
    }

    if (visitorFromStorage) {
      try {
        setVisitor(JSON.parse(visitorFromStorage));
      } catch (error) {
        console.error("Failed to read visitor data:", error);
        setVisitor(null);
      }
    }
  }, [location.state]);

  const handleFinish = () => {
    localStorage.removeItem("visitorData");
    navigate("/");
  };

  if (!visitor) {
    return (
      <div className="v-container">
        <div
          className="v-card"
          style={{
            textAlign: "center",
            padding: "40px",
          }}
        >
          <p>⏳ Loading pass configuration...</p>

          <button
            type="button"
            className="primary-btn"
            onClick={() => navigate("/register")}
            style={{
              marginTop: "16px",
              width: "100%",
              padding: "14px",
              cursor: "pointer",
            }}
          >
            Back to Registration
          </button>
        </div>
      </div>
    );
  }

  const visitorPhoto = visitor.photo || visitor.photoUrl;
  const visitorName = visitor.name || "Visitor";
  const visitorPhone = visitor.phone || visitor.mobileNumber || "Not Provided";
  const visitorPurpose = visitor.purpose || visitor.purposeOfVisit || "Visit";
  const visitorPassId = visitor.id || visitor.visitorId || "VERIFIED";

  return (
    <div className="v-container">
      <div
        className="v-card"
        style={{
          maxHeight: "90vh",
          overflowY: "auto",
          paddingBottom: "24px",
        }}
      >
        <div
          className="v-header"
          style={{
            justifyContent: "center",
          }}
        >
          <div
            className="v-logo"
            style={{
              cursor: "pointer",
            }}
            onClick={() => navigate("/")}
          >
            Visitor<span>X</span>
          </div>
        </div>

        <div
          className="v-meta-head"
          style={{
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              marginBottom: "4px",
            }}
          >
            ✅
          </div>

          <h2
            style={{
              color: "#2e7d32",
              margin: "0 0 4px 0",
            }}
          >
            Registration Successful!
          </h2>

          <p style={{ margin: 0 }}>
            Your digital entry pass has been generated securely.
          </p>
        </div>

        <div
          style={{
            background: "#f8f9fa",
            border: "2px dashed #dbdeb2",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            marginBottom: "20px",
          }}
        >
          {visitorPhoto && (
            <img
              src={visitorPhoto}
              alt="Visitor"
              style={{
                width: "110px",
                height: "110px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "4px solid #fff",
                boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
              }}
            />
          )}

          <div style={{ textAlign: "center" }}>
            <h3
              style={{
                margin: "0 0 2px 0",
                fontSize: "20px",
                color: "#1a1a1a",
              }}
            >
              {visitorName}
            </h3>

            <p
              style={{
                margin: "0",
                color: "#666",
                fontSize: "14px",
              }}
            >
              📞 {visitorPhone}
            </p>

            <span
              style={{
                display: "inline-block",
                marginTop: "6px",
                padding: "4px 12px",
                background: "#e8f0fe",
                color: "#1a73e8",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: "600",
              }}
            >
              {visitorPurpose}
            </span>
          </div>

          <hr
            style={{
              width: "100%",
              border: "0",
              borderTop: "1px dashed #ccc",
              margin: "4px 0",
            }}
          />

          <div style={{ textAlign: "center", width: "100%" }}>
            <div
              style={{
                background: "#fff",
                padding: "12px",
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
                display: "inline-block",
              }}
            >
              <div
                style={{
                  fontSize: "50px",
                  lineHeight: "1",
                }}
              >
                🔳
              </div>
            </div>

            <p
              style={{
                margin: "6px 0 0 0",
                fontSize: "11px",
                color: "#999",
                letterSpacing: "1px",
              }}
            >
              PASS ID: {visitorPassId}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="primary-btn"
          onClick={handleFinish}
          style={{
            width: "100%",
            padding: "14px",
            cursor: "pointer",
          }}
        >
          ✓ Done & Finish Registration
        </button>
      </div>
    </div>
  );
}