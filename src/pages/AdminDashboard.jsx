import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import {
  adminLogin,
  adminLogout,
  getAllVisitors,
  deleteVisitorByAdmin,
} from "../services/visitorService";

const AUTO_LOGOUT_TIME = 30 * 60 * 1000;

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!sessionStorage.getItem("adminToken")
  );

  const [loginForm, setLoginForm] = useState({
    username: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");
  const [visitors, setVisitors] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getVisitorId = (v) =>
    v.visitorId || v.id || v.visitorID || "";

  const getVisitorPhone = (v) =>
    v.mobileNumber || v.phone || v.mobile || "";

  const getVisitorPurpose = (v) =>
    v.purposeOfVisit || v.purpose || v.visitPurpose || "";

  const getVisitorTime = (v) =>
    v.visitDateTime ||
    v.checkInTime ||
    v.createdAt ||
    v.timestamp ||
    "";

  const getVisitorPhoto = (v) =>
    v.photoBase64 || v.photo || v.image || v.visitorPhoto || "";

  const handleForceLogout = async () => {
    try {
      await adminLogout();
    } catch {
      sessionStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminLoginTime");
    }

    setIsAuthenticated(false);
    setVisitors([]);
    navigate("/admin");
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    const loginTime = Number(sessionStorage.getItem("adminLoginTime"));
    const now = Date.now();

    if (!loginTime || now - loginTime > AUTO_LOGOUT_TIME) {
      handleForceLogout();
      return;
    }

    const timer = setTimeout(() => {
      handleForceLogout();
    }, AUTO_LOGOUT_TIME - (now - loginTime));

    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllVisitors();

      console.log("Backend visitors:", response);

      const visitorList = Array.isArray(response)
        ? response
        : response?.content ||
          response?.data ||
          response?.visitors ||
          response?.visitorList ||
          response?.records ||
          [];

      setVisitors(Array.isArray(visitorList) ? [...visitorList].reverse() : []);
    } catch (err) {
      console.error("Admin dashboard error:", err);
      setError("Unable to load visitor data from backend.");
      setVisitors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboardData();
    }
  }, [isAuthenticated]);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setLoginForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoginError("");

    if (!loginForm.username.trim() || !loginForm.password.trim()) {
      setLoginError("Please enter username and password");
      return;
    }

    try {
      const result = await adminLogin({
        username: loginForm.username.trim(),
        password: loginForm.password.trim(),
      });
      console.log("Login Response:", result);
      const token =
        result.token ||
        result.jwt ||
        result.accessToken ||
        result.access_token;
      console.log("Saved token:", token);

      if (!token || typeof token !== "string") {
        throw new Error("Login token not found in backend response");
      }

      sessionStorage.setItem("adminToken", token);
      sessionStorage.setItem("adminLoginTime", Date.now().toString());

      setIsAuthenticated(true);
      setLoginError("");
      setLoginForm({ username: "", password: "" });
    } catch (err) {
      console.error("Admin login error:", err);
      setLoginError("Invalid username or password");
    }
  };

  const handleLogout = async () => {
    await handleForceLogout();
  };

  // Upgraded handler to generate a native .xlsx file with cell image layouts
  const handleExportExcel = async () => {
    if (visitors.length === 0) {
      alert("There are no visitor records available to export yet.");
      return;
    }

    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Visitor Logs");

      // Setup clean table blueprint schemas
      worksheet.columns = [
        { header: "S.No", key: "sno", width: 8 },
        { header: "Photo Avatar", key: "photo", width: 14 },
        { header: "ID", key: "id", width: 15 },
        { header: "Name", key: "name", width: 25 },
        { header: "Mobile Number", key: "phone", width: 18 },
        { header: "Email", key: "email", width: 28 },
        { header: "Purpose of Visit", key: "purpose", width: 22 },
        { header: "Check-In Time", key: "time", width: 26 },
      ];

      // Style Header Cells
      const headerRow = worksheet.getRow(1);
      headerRow.height = 28;
      headerRow.eachCell((cell) => {
        cell.font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFF" } };
        cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "0A1128" } };
        cell.alignment = { vertical: "middle", horizontal: "center" };
      });

      // Loop through data array to set cells values and base64 canvas offsets
      for (let index = 0; index < visitors.length; index++) {
        const v = visitors[index];
        const currentRowNum = index + 2;

        worksheet.addRow({
          sno: index + 1,
          photo: "", // Empty string slot serves as background canvas placeholder
          id: getVisitorId(v) || "—",
          name: v.name || "—",
          phone: getVisitorPhone(v) || "—",
          email: v.email || "—",
          purpose: getVisitorPurpose(v) || "—",
          time: getVisitorTime(v) || "—",
        });

        const row = worksheet.getRow(currentRowNum);
        row.height = 48; // Give enough height room for images previewing inside grid cells
        row.eachCell((cell) => {
          cell.alignment = { vertical: "middle", horizontal: "left" };
        });
        worksheet.getCell(`A${currentRowNum}`).alignment = { vertical: "middle", horizontal: "center" };

        // Process Base64 photo rendering pipeline safely
        const photoString = getVisitorPhoto(v);
        if (photoString && typeof photoString === "string") {
          try {
            const cleanBase64 = photoString.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");
            
            const imageId = workbook.addImage({
              base64: cleanBase64,
              extension: "jpeg",
            });

            worksheet.addImage(imageId, {
              tl: { col: 1, row: currentRowNum - 1 },
              ext: { width: 50, height: 50 },
              editAs: "oneCell",
            });
          } catch (imgErr) {
            console.warn("Failed rendering image for index:", index, imgErr);
          }
        }
      }

      const buffer = await workbook.xlsx.writeBuffer();
      const fileBlob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      
      saveAs(fileBlob, `Visitor_Logs_Export_${new Date().toISOString().split("T")[0]}.xlsx`);
    } catch (excelErr) {
      console.error("Excel rendering failure:", excelErr);
      alert("Failed creating native spreadsheet output stream.");
    }
  };

  const handleNavigateToRegister = () => navigate("/register");
  const handleNavigateToCapture = () => navigate("/capture");

  const handleEdit = (visitor) => {
    navigate("/register", {
      state: {
        editMode: true,
        visitorData: visitor,
      },
    });
  };

  const handleDelete = async (id, name) => {
    const confirmDelete = window.confirm(
      `🗑️ Delete ${name}'s check-in record completely from logs?`
    );

    if (!confirmDelete) return;

    try {
      await deleteVisitorByAdmin(id);
      setVisitors((prev) => prev.filter((v) => getVisitorId(v) !== id));
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed. Please check backend API.");
    }
  };

  const filteredVisitors = visitors.filter((visitor) => {
    const query = searchQuery.toLowerCase();

    return (
      (visitor.name && visitor.name.toLowerCase().includes(query)) ||
      (getVisitorPhone(visitor) &&
        getVisitorPhone(visitor).toLowerCase().includes(query)) ||
      (visitor.email && visitor.email.toLowerCase().includes(query))
    );
  });

  const todayVisitors = visitors.length;
  const weekVisitors = visitors.length;
  const monthVisitors = visitors.length;
  const totalVisitors = visitors.length;

  const getBadgeStyle = (purpose) => {
    const checkPurpose = purpose ? purpose.toLowerCase() : "";

    if (checkPurpose.includes("interview"))
      return { background: "#e8f5e9", color: "#2e7d32" };

    if (checkPurpose.includes("meeting"))
      return { background: "#e3f2fd", color: "#1565c0" };

    if (checkPurpose.includes("internship"))
      return { background: "#f3e5f5", color: "#6a1b9a" };

    return { background: "#f3f4f6", color: "#374151" };
  };

  if (!isAuthenticated) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #e0ecff, #f8fbff)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          padding: "20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "430px",
            background: "#0a1128",
            borderRadius: "22px",
            padding: "38px 34px",
            boxShadow: "0 25px 60px rgba(15, 23, 42, 0.25)",
            color: "#fff",
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontSize: "26px",
              fontWeight: "900",
              marginBottom: "8px",
            }}
          >
            Visitor<span style={{ color: "#3b82f6" }}>X</span>
          </div>

          <h2
            style={{
              textAlign: "center",
              margin: "18px 0 8px",
              fontSize: "28px",
              fontWeight: "900",
            }}
          >
            Admin Login
          </h2>

          <p
            style={{
              textAlign: "center",
              color: "#94a3b8",
              marginBottom: "28px",
              fontSize: "14px",
            }}
          >
            Enter credentials to access dashboard panel
          </p>

          <form onSubmit={handleAdminLogin}>
            <label style={{ fontSize: "14px", fontWeight: "700" }}>
              Username
            </label>

            <input
              type="text"
              name="username"
              value={loginForm.username}
              onChange={handleLoginChange}
              placeholder="Enter username"
              style={{
                width: "100%",
                marginTop: "8px",
                marginBottom: "18px",
                padding: "14px 15px",
                borderRadius: "10px",
                border: "1px solid #334155",
                background: "#111827",
                color: "#fff",
                outline: "none",
                fontSize: "15px",
                boxSizing: "border-box",
              }}
            />

            <label style={{ fontSize: "14px", fontWeight: "700" }}>
              Password
            </label>

            <input
              type="password"
              name="password"
              value={loginForm.password}
              onChange={handleLoginChange}
              placeholder="Enter password"
              style={{
                width: "100%",
                marginTop: "8px",
                marginBottom: "12px",
                padding: "14px 15px",
                borderRadius: "10px",
                border: "1px solid #334155",
                background: "#111827",
                color: "#fff",
                outline: "none",
                fontSize: "15px",
                boxSizing: "border-box",
              }}
            />

            {loginError && (
              <div
                style={{
                  background: "#fee2e2",
                  color: "#b91c1c",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontWeight: "700",
                  marginBottom: "14px",
                }}
              >
                {loginError}
              </div>
            )}

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "15px",
                borderRadius: "12px",
                border: "none",
                background: "#2563eb",
                color: "#fff",
                fontSize: "15px",
                fontWeight: "800",
                cursor: "pointer",
                marginTop: "8px",
              }}
            >
              Login to Dashboard →
            </button>
          </form>

          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              width: "100%",
              marginTop: "18px",
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "600",
            }}
          >
            ← Back to Visitor Screen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        maxHeight: "100vh",
        overflow: "hidden",
        fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Sidebar Frame */}
      <div
        style={{
          width: "260px",
          minWidth: "260px",
          background: "#0a1128",
          color: "#fff",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          boxSizing: "border-box",
          height: "100%",
        }}
      >
        <div
          style={{
            fontSize: "26px",
            fontWeight: "bold",
            marginBottom: "40px",
            color: "#fff",
            letterSpacing: "0.5px",
            flexShrink: 0,
          }}
        >
          Visitor<span style={{ color: "#1a73e8" }}>X</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", flex: 1, overflowY: "auto", marginBottom: "16px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              background: "#1a73e8",
              padding: "14px 16px",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "15px",
              cursor: "pointer",
            }}
          >
            📊 &nbsp;Dashboard
          </div>

          <div onClick={handleNavigateToRegister} style={menuStyle}>
            📝 &nbsp;Register Form View
          </div>

          <div onClick={handleNavigateToCapture} style={menuStyle}>
            🏠 &nbsp;Client Facing Screen
          </div>

          <div onClick={handleExportExcel} style={menuStyle}>
            💾 &nbsp;Export Data
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            borderTop: "1px solid #1e293b",
            padding: "20px",
            flexShrink: 0,
          }}
        >
          <div style={{ color: "#94a3b8", cursor: "pointer", fontSize: "14px", fontWeight: "500" }}>
            ⚙️ &nbsp;Settings
          </div>

          <div
            style={{
              color: "#f87171",
              fontWeight: "700",
              cursor: "pointer",
              fontSize: "14px",
            }}
            onClick={handleLogout}
          >
            🚪 &nbsp;Log Out
          </div>
        </div>
      </div>

      {/* Main Content Pane */}
      <div
        style={{
          flex: 1,
          padding: "30px 40px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "24px",
            position: "relative",
            flexShrink: 0,
          }}
        >
          <h1
            style={{
              margin: 0,
              fontSize: "30px",
              fontWeight: "800",
              color: "#111827",
              letterSpacing: "-0.5px",
            }}
          >
            Dashboard
          </h1>

          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontSize: "14px", color: "#4b5563", fontWeight: "700" }}>
              📅 {new Date().toLocaleDateString("en-IN")}
            </div>

            <div
              onClick={() => setIsAdminMenuOpen(!isAdminMenuOpen)}
              style={{
                fontSize: "14px",
                color: "#4b5563",
                fontWeight: "700",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                cursor: "pointer",
                padding: "8px 12px",
                borderRadius: "6px",
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                userSelect: "none",
              }}
            >
              👤 Admin ▾
            </div>

            {isAdminMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "45px",
                  right: "0",
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                  border: "1px solid #e2e8f0",
                  width: "160px",
                  zIndex: 10,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "10px 16px",
                    fontSize: "14px",
                    color: "#374151",
                    cursor: "pointer",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                  onClick={() => alert("Profile Settings Coming Soon")}
                >
                  My Profile
                </div>

                <div
                  style={{
                    padding: "10px 16px",
                    fontSize: "14px",
                    color: "#ef4444",
                    fontWeight: "600",
                    cursor: "pointer",
                  }}
                  onClick={handleLogout}
                >
                  Log Out
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analytics Grid Block */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "20px",
            marginBottom: "24px",
            flexShrink: 0,
          }}
        >
          {[
            { label: "TODAY'S VISITORS", count: todayVisitors, color: "#1a73e8", icon: "👥" },
            { label: "THIS WEEK", count: weekVisitors, color: "#111827", icon: "📅" },
            { label: "THIS MONTH", count: monthVisitors, color: "#111827", icon: "📈" },
            { label: "TOTAL VISITORS", count: totalVisitors, color: "#111827", icon: "📊" },
          ].map((card, i) => (
            <div
              key={i}
              style={{
                background: "#fff",
                padding: "20px",
                borderRadius: "14px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02), 0 1px 2px rgba(0,0,0,0.04)",
                position: "relative",
                border: "1px solid #f3f4f6",
              }}
            >
              <div style={{ fontSize: "11px", color: "#6b7280", fontWeight: "800", letterSpacing: "0.5px" }}>
                {card.label}
              </div>

              <div style={{ fontSize: "28px", fontWeight: "800", marginTop: "4px", color: card.color }}>
                {card.count}
              </div>

              <span style={{ position: "absolute", right: "20px", bottom: "20px", fontSize: "22px", opacity: 0.3 }}>
                {card.icon}
              </span>
            </div>
          ))}
        </div>

        {/* Action controls row */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", flexShrink: 0 }}>
          <input
            type="text"
            placeholder="Search by name, email or mobile number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "360px",
              padding: "12px 16px",
              borderRadius: "10px",
              border: "1px solid #cbd5e1",
              color: "#111827",
              fontWeight: "600",
              fontSize: "14px",
              outline: "none",
              backgroundColor: "#fff",
            }}
          />

          <div style={{ display: "flex", gap: "12px" }}>
            <button onClick={fetchDashboardData} style={refreshButtonStyle}>
              🔄 Refresh
            </button>

            <button onClick={handleExportExcel} style={exportButtonStyle}>
              📥 Export Excel
            </button>

            <button onClick={handleNavigateToRegister} style={addButtonStyle}>
              + Add Visitor
            </button>
          </div>
        </div>

        {loading && (
          <p style={{ fontWeight: "700", color: "#2563eb", flexShrink: 0, margin: "0 0 12px 0" }}>
            Loading visitor data from backend...
          </p>
        )}

        {error && <p style={{ fontWeight: "700", color: "#dc2626", flexShrink: 0, margin: "0 0 12px 0" }}>{error}</p>}

        {/* Data Table Block */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            flex: 1,
            overflowX: "auto",
            overflowY: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: "1000px", tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: "5%" }} />
              <col style={{ width: "8%" }} />
              <col style={{ width: "16%" }} />
              <col style={{ width: "13%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "10%" }} />
            </colgroup>
            <thead>
              <tr
                style={{
                  background: "#f8fafc",
                  borderBottom: "1px solid #e2e8f0",
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: "800",
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                }}
              >
                <th style={{ padding: "14px 16px" }}>#</th>
                <th style={{ padding: "14px 16px" }}>Photo</th>
                <th style={{ padding: "14px 16px" }}>Name</th>
                <th style={{ padding: "14px 16px" }}>Mobile</th>
                <th style={{ padding: "14px 16px" }}>Email</th>
                <th style={{ padding: "14px 16px" }}>Purpose</th>
                <th style={{ padding: "14px 16px" }}>Check-In Time</th>
                <th style={{ padding: "14px 16px", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {!loading && filteredVisitors.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      padding: "28px",
                      textAlign: "center",
                      color: "#64748b",
                      fontWeight: "700",
                    }}
                  >
                    No visitor data available from backend.
                  </td>
                </tr>
              ) : (
                filteredVisitors.map((visitor, index) => {
                  const visitorId = getVisitorId(visitor);
                  const purpose = getVisitorPurpose(visitor);
                  const photoSrc = getVisitorPhoto(visitor);

                  return (
                    <tr
                      key={visitorId || index}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        fontSize: "13px",
                        color: "#111827",
                      }}
                    >
                      <td style={{ padding: "12px 16px", fontWeight: "700" }}>
                        {index + 1}
                      </td>

                      <td style={{ padding: "8px 16px", verticalAlign: "middle" }}>
                        {photoSrc ? (
                          <img
                            src={photoSrc}
                            alt={`${visitor.name || "Visitor"}'s Avatar`}
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              objectFit: "cover",
                              border: "1px solid #cbd5e1",
                              display: "block",
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: "44px",
                              height: "44px",
                              borderRadius: "50%",
                              backgroundColor: "#f1f5f9",
                              color: "#64748b",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "16px",
                              border: "1px solid #e2e8f0",
                            }}
                          >
                            👤
                          </div>
                        )}
                      </td>

                      <td style={{ padding: "12px 16px", fontWeight: "700", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {visitor.name || "—"}
                      </td>

                      <td style={{ padding: "12px 16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {getVisitorPhone(visitor) || "—"}
                      </td>

                      <td style={{ padding: "12px 16px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {visitor.email || "—"}
                      </td>

                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            ...getBadgeStyle(purpose),
                            padding: "4px 10px",
                            borderRadius: "999px",
                            fontWeight: "800",
                            fontSize: "11px",
                            display: "inline-block",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "100%",
                          }}
                        >
                          {purpose || "—"}
                        </span>
                      </td>

                      <td style={{ padding: "12px 16px", color: "#64748b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {getVisitorTime(visitor) || "—"}
                      </td>

                      <td style={{ padding: "12px 16px", whiteSpace: "nowrap", textAlign: "center" }}>
                        <button onClick={() => handleEdit(visitor)} style={editButtonStyle}>
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(visitorId, visitor.name || "Visitor")}
                          style={deleteButtonStyle}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const menuStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "14px 16px",
  borderRadius: "8px",
  color: "#94a3b8",
  fontWeight: "600",
  fontSize: "15px",
  cursor: "pointer",
};

const refreshButtonStyle = {
  padding: "10px 16px",
  background: "#ecfdf5",
  border: "1px solid #bbf7d0",
  borderRadius: "10px",
  fontWeight: "700",
  color: "#166534",
  cursor: "pointer",
  fontSize: "13px",
};

const exportButtonStyle = {
  padding: "10px 18px",
  background: "#f1f5f9",
  border: "1px solid #cbd5e1",
  borderRadius: "10px",
  fontWeight: "700",
  color: "#334155",
  cursor: "pointer",
  fontSize: "13px",
};

const addButtonStyle = {
  padding: "10px 18px",
  background: "#1a73e8",
  color: "#fff",
  border: "none",
  borderRadius: "10px",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "13px",
};

const editButtonStyle = {
  padding: "6px 10px",
  border: "none",
  background: "#dbeafe",
  color: "#1d4ed8",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "12px",
  marginRight: "4px",
};

const deleteButtonStyle = {
  padding: "6px 10px",
  border: "none",
  background: "#fee2e2",
  color: "#b91c1c",
  borderRadius: "6px",
  cursor: "pointer",
  fontWeight: "700",
  fontSize: "12px",
};