import { useState } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  // Toggle the mobile drawer menu open and closed
  const toggleMenu = () => setIsOpen(!isOpen);

  return (
    <header style={{ position: "relative", zIndex: 1000 }}>
      {/* --- Main Navbar Header --- */}
      <nav
        style={{
          background: "#2563eb",
          padding: "15px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        {/* Left Side: Mobile Menu Trigger + Brand Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          {/* Mobile Hamburger Button - Hidden on desktop views, visible on mobile screens */}
          <button
            onClick={toggleMenu}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
              padding: "0",
              display: "flex",
              alignItems: "center",
            }}
            aria-label="Toggle Navigation Menu"
          >
            {isOpen ? "✕" : "☰"}
          </button>

          <h2 style={{ color: "white", margin: 0, fontSize: "20px", fontWeight: "600" }}>
            VisitorX
          </h2>
        </div>

        {/* Right Side Desktop Links - Standard inline view */}
        <div className="desktop-nav-links" style={{ display: "flex" }}>
          <Link to="/" style={{ color: "white", marginRight: "20px", textDecoration: "none", fontWeight: "500" }}>
            Home
          </Link>
          <Link to="/admin" style={{ color: "white", textDecoration: "none", fontWeight: "500" }}>
            Admin
          </Link>
        </div>
      </nav>

      {/* --- Responsive Mobile Dropdown Drawer --- */}
      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            width: "100%",
            background: "#1e40af", // Slightly darker matching blue hue
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.15)",
            display: "flex",
            flexDirection: "column",
            padding: "10px 0",
            animation: "fadeIn 0.2s ease-out",
          }}
        >
          <Link
            to="/"
            onClick={() => setIsOpen(false)} // Auto-closes drawer on selection
            style={{
              color: "white",
              padding: "12px 20px",
              textDecoration: "none",
              fontWeight: "500",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            Home
          </Link>
          <Link
            to="/admin"
            onClick={() => setIsOpen(false)}
            style={{
              color: "white",
              padding: "12px 20px",
              textDecoration: "none",
              fontWeight: "500",
            }}
          >
            Admin
          </Link>
        </div>
      )}
    </header>
  );
}