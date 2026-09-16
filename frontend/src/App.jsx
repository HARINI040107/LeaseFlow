import { Navigate, Route, Routes } from "react-router-dom";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ApplicationWizard from "./pages/ApplicationWizard";
import TenantPortal from "./pages/TenantPortal";
import Review from "./pages/Review";

export function getSession() {
  try {
    return JSON.parse(localStorage.getItem("lease_session") || "null");
  } catch {
    return null;
  }
}

export function setSession(user) {
  localStorage.setItem("lease_session", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("lease_session");
  localStorage.removeItem("lease_application");
}

function ProtectedRoute({ children }) {
  return getSession() ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Homeowner pages */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/application/:id"
        element={
          <ProtectedRoute>
            <ApplicationWizard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/review/:id"
        element={
          <ProtectedRoute>
            <Review />
          </ProtectedRoute>
        }
      />

      {/* Tenant does not need an account */}
      <Route path="/tenant/:token" element={<TenantPortal />} />

      {/* Unknown URL */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;