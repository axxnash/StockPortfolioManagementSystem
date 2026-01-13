import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddStock from "./pages/AddStock";
import Analytics from "./pages/Analytics";
import ProtectedRoute from "./auth/ProtectedRoute";
import Navbar from "./components/NavBar";

export default function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <Navbar />

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="rounded-2xl border border-slate-200/70 bg-white/70 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/50">
          <div className="p-4 sm:p-6 lg:p-8">
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/add"
                element={
                  <ProtectedRoute>
                    <AddStock />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/analytics"
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </div>

        <footer className="mt-8 text-center text-xs text-slate-400">
          SPMS • Stock Portfolio Management System
        </footer>
      </main>
    </div>
  );
}
