import VisitorForm from "../components/VisitorForm";
import { useLocation } from "react-router-dom";

export default function RegistrationPage() {
   const location = useLocation();
  return (
    
   
    <div className="v-container">
      <div className="v-card">
        <div className="v-header">
          <button className="back-btn" onClick={() => window.history.back()}>
            ←
          </button>

          <div className="v-logo">
            Visitor<span>X</span>
          </div>

          <div className="lang-badge">🌐 EN ▾</div>
        </div>

        <div className="v-title">
          <h1>Visitor Registration</h1>
          <p>Please enter your details</p>
        </div>

        <VisitorForm
      editMode={location.state?.editMode || false}
      visitorData={location.state?.visitorData || null}
    />
 
      </div>
    </div>
  );
}