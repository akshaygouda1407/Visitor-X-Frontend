import { BrowserRouter, Routes, Route } from "react-router-dom";

// 🚀 FIXED PATH: Points directly inside your styles folder
import "./styles/global.css"; 

import WelcomePage from "./pages/WelcomePage";
import RegistrationPage from "./pages/RegistrationPage";
import CapturePhotoPage from "./pages/CapturePhotoPage";
import SuccessPage from "./pages/SuccessPage";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/register" element={<RegistrationPage />} />
        <Route path="/capture" element={<CapturePhotoPage />} />
        <Route path="/success" element={<SuccessPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;