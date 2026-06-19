import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PhotoCapture from "../components/PhotoCapture";
import { registerVisitor } from "../services/visitorService";

export default function CapturePhotoPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const visitorDetails =
    location.state?.visitorDetails ||
    JSON.parse(localStorage.getItem("visitorData") || "{}");

  const purposeMap = {
    Meeting: "MEETING",
    Interview: "INTERVIEW",
    Internship: "INTERNSHIP",
    "Full Time Employment": "FULL_TIME_EMPLOYMENT",
    MEETING: "MEETING",
    INTERVIEW: "INTERVIEW",
    INTERNSHIP: "INTERNSHIP",
    FULL_TIME_EMPLOYMENT: "FULL_TIME_EMPLOYMENT",
  };

  const handleConfirmPhoto = async () => {
    if (!image) {
      alert("Please capture a photo first!");
      return;
    }

    const selectedPurpose =
      visitorDetails?.purpose || visitorDetails?.purposeOfVisit;

    const purpose = purposeMap[selectedPurpose];

    if (
      !visitorDetails?.name ||
      !(visitorDetails?.phone || visitorDetails?.mobileNumber) ||
      !visitorDetails?.email ||
      !purpose
    ) {
      alert(
        "Visitor form details are missing or purpose value is invalid. Please fill the registration form again."
      );
      navigate("/register");
      return;
    }

    setLoading(true);

    try {
      const savedVisitor = await registerVisitor({
        name: visitorDetails.name,
        mobileNumber:
          visitorDetails.phone || visitorDetails.mobileNumber,
        email: visitorDetails.email,
        address: visitorDetails.address || "Not Provided",
        purposeOfVisit: purpose,
        photoBase64: image,
      });

      localStorage.setItem("visitorData", JSON.stringify(savedVisitor));

      navigate("/success", {
        state: { visitor: savedVisitor },
      });
    } catch (error) {
      console.error("Visitor registration failed:", error);
      alert(error.message || "Failed to register visitor. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="v-container" style={styles.container}>
      {/* Step Heading outside the main card */}
      <div style={styles.stepHeader}>3. PHOTO CAPTURE</div>

      <div className="v-card" style={styles.card}>
        {/* Header containing Back Button and centered VisitorX Logo */}
        <div style={styles.headerContainer}>
          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/register")}
            disabled={loading}
            style={styles.backButton}
          >
            ←
          </button>
          <div className="v-logo" style={styles.logo}>
            Visitor<span style={{ color: "#1d59db" }}>X</span>
          </div>
        </div>

        {/* Subheadings centered */}
        <div className="v-meta-head" style={styles.metaHead}>
          <h2 style={styles.metaTitle}>Please take a clear photo</h2>
          <p style={styles.metaSubtitle}>Make sure your face is visible</p>
        </div>

        {/* Camera capture / Image preview component */}
        <PhotoCapture image={image} setImage={setImage} />

        {/* Bottom Actions Row: Guaranteed clean horizontal side-by-side alignment */}
        <div className="v-footer-action" style={styles.footerAction}>
          <button
            type="button"
            className="secondary-btn"
            onClick={() => setImage(null)}
            disabled={loading}
            style={styles.secondaryBtn}
          >
            <span style={{ marginRight: "4px" }}>↻</span> Retake
          </button>

          <button
            type="button"
            className="primary-btn"
            onClick={handleConfirmPhoto}
            disabled={loading || !image}
            style={{
              ...styles.primaryBtn,
              opacity: !image ? 0.6 : 1,
              cursor: !image ? "not-allowed" : "pointer"
            }}
          >
            <span style={{ marginRight: "6px" }}>✓</span>
            {loading ? "Submitting..." : "Use Photo"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    padding: "20px",
    boxSizing: "border-box",
  },
  stepHeader: {
    color: "#1d59db",
    fontWeight: "700",
    fontSize: "14px",
    letterSpacing: "0.5px",
    marginBottom: "16px",
    textTransform: "uppercase",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "24px",
    border: "1px solid #eef2f6",
    boxShadow: "0 12px 30px rgba(0, 0, 0, 0.04)",
    width: "100%",
    maxWidth: "380px",
    padding: "28px 24px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
  headerContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: "20px",
  },
  backButton: {
    position: "absolute",
    left: "0",
    background: "none",
    border: "none",
    fontSize: "22px",
    color: "#334155",
    cursor: "pointer",
    padding: "0",
    display: "flex",
    alignItems: "center",
  },
  logo: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.5px",
  },
  metaHead: {
    textAlign: "center",
    marginBottom: "20px",
  },
  metaTitle: {
    fontSize: "17px",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 6px 0",
  },
  metaSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0",
  },
  footerAction: {
    display: "flex",
    flexDirection: "row",
    gap: "12px",
    width: "100%",
    marginTop: "4px",
    boxSizing: "border-box",
  },
  secondaryBtn: {
    flex: "1 1 0%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "44px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
    cursor: "pointer",
  },
  primaryBtn: {
    flex: "1 1 0%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "44px",
    backgroundColor: "#1d59db",
    border: "none",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#ffffff",
  },
};