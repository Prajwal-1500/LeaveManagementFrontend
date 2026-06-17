import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import ManagerDashboard from "./pages/ManagerDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function Unauthorized() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <h2>403 — Unauthorized</h2>
        <p className="text-muted">
          You don't have permission to view this page.
        </p>
        <a href="/login" className="btn btn-primary">
          Back to Login
        </a>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {}
          <Route
            path="/employee"
            element={
              <ProtectedRoute roles={["Employee"]}>
                <EmployeeDashboard />
              </ProtectedRoute>
            }
          />

          {}
          <Route
            path="/manager"
            element={
              <ProtectedRoute roles={["Manager"]}>
                <ManagerDashboard />
              </ProtectedRoute>
            }
          />

          {}
          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["HRAdmin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
