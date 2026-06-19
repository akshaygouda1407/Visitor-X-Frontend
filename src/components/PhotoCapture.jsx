import Webcam from "react-webcam";
import { useRef } from "react";

export default function PhotoCapture({ image, setImage }) {
  const webcamRef = useRef(null);

  const capture = () => {
    const imageSrc = webcamRef.current?.getScreenshot();

    if (!imageSrc) {
      alert("Unable to capture image. Please allow camera access.");
      return;
    }

    setImage(imageSrc);
  };

  // Decreased dimensions and turned into a clean 1:1 aspect ratio square setup
  const videoConstraints = {
    width: 360,
    height: 360,
    facingMode: "user",
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.cameraBox}>
        {image ? (
          <img src={image} alt="Captured Profile" style={styles.mediaElement} />
        ) : (
          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            style={styles.mediaElement}
            onUserMediaError={(err) => {
              console.error("Camera Error:", err);
              alert("Camera access denied. Please allow permissions and refresh.");
            }}
          />
        )}
      </div>

      {/* Capture trigger displays inline only when no photo has been taken yet */}
      {!image && (
        <button
          type="button"
          onClick={capture}
          style={styles.captureBtn}
        >
          📸 Capture Photo
        </button>
      )}
    </div>
  );
}

const styles = {
  wrapper: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  cameraBox: {
    width: "100%",
    maxWidth: "290px",       // Balanced reduced width framing
    aspectRatio: "1 / 1",    // Perfect square viewport look
    borderRadius: "16px",    // Clean rounded bounding container corners
    overflow: "hidden",
    backgroundColor: "#f1f5f9",
    border: "1px solid #e2e8f0",
    marginBottom: "20px",
  },
  mediaElement: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  captureBtn: {
    width: "100%",
    maxWidth: "290px",
    height: "42px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    backgroundColor: "#ffffff",
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#334155",
    cursor: "pointer",
    marginBottom: "16px",
  },
};