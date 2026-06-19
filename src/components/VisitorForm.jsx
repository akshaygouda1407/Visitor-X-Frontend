import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { updateVisitor } from "../services/visitorService";

export default function VisitorForm( {
  editMode=false,
  visitorData=null,})
{
  const navigate = useNavigate();
  const location = useLocation();


  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    purpose: "",
  });

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (editMode && visitorData) {
      
      setFormData({
        name: visitorData.name || "",
        phone: visitorData.mobileNumber || visitorData.phone || "",
        email: visitorData.email || "",
        purpose: visitorData.purposeOfVisit || visitorData.purpose || "",
      });
    }
  }, [editMode, visitorData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "phone" ? value.replace(/\D/g, "").slice(0, 10) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    if (!formData.name || !formData.phone || !formData.email || !formData.purpose) {
      setApiError("Please fill all required details.");
      return;
    }

    if (formData.phone.length !== 10) {
      setApiError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!formData.email.endsWith("@gmail.com")) {
      setApiError("Please enter a valid Gmail address only.");
      return;
    }

    setLoading(true);

    try {
      const visitorDetails = {
        name: formData.name.trim(),
        mobileNumber: formData.phone.trim(),
        email: formData.email.trim(),
        purposeOfVisit: formData.purpose,
      };
      console.log("editMode=",editMode);
      console.log("visitorData=",visitorData);
      if (editMode && visitorData) {
        const visitorId = visitorData.visitorId || visitorData.id;

        await updateVisitor(visitorId, visitorDetails);

        alert("Visitor updated successfully!");
        navigate("/admin");
        return;
      }

      localStorage.setItem(
        "visitorData",
        JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          email: formData.email.trim(),
          purpose: formData.purpose,
        })
      );

      navigate("/capture", {
        state: {
          visitorDetails: {
            name: formData.name.trim(),
            phone: formData.phone.trim(),
            email: formData.email.trim(),
            purpose: formData.purpose,
          },
        },
      });
    } catch (error) {
      console.error("Form submit error:", error);
      setApiError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="visitor-form" onSubmit={handleSubmit}>
      <label className="form-label">Full Name</label>
      <input
        type="text"
        name="name"
        className="form-input"
        placeholder="👤 Enter your name"
        value={formData.name}
        onChange={handleChange}
      />

      <label className="form-label">Mobile Number</label>
      <input
        type="tel"
        name="phone"
        className="form-input"
        placeholder="📞 Enter 10-digit mobile number"
        value={formData.phone}
        onChange={handleChange}
        maxLength={10}
      />

      <label className="form-label">Email Address</label>
      <input
        type="email"
        name="email"
        className="form-input"
        placeholder="✉️ Enter your Gmail address"
        value={formData.email}
        onChange={handleChange}
      />

      <label className="form-label">Purpose of Visit</label>
      <select
        name="purpose"
        className="form-input"
        value={formData.purpose}
        onChange={handleChange}
      >
        <option value="">Select Purpose</option>
        <option value="INTERVIEW">Interview</option>
        <option value="MEETING">Meeting</option>
        <option value="FULL_TIME_EMPLOYMENT">Full Time Employment</option>
        <option value="INTERNSHIP">Internship</option>
      </select>

      {apiError && <p className="form-error">{apiError}</p>}

      <button type="submit" className="primary-btn" disabled={loading}>
        {loading
          ? "⏳ Processing..."
          : editMode
          ? "✅ Update Visitor"
          : "👤 Continue"}
      </button>
    </form>
  );
}