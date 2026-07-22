import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { SignupPage } from "./pages/SignupPage";
import { VerifyOtpPage } from "./pages/VerifyOtpPage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";

export function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-otp" element={<VerifyOtpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
