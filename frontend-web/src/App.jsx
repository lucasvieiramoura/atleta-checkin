import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FormBuilder from './pages/FormBuilder';
import { ProtectedRoute } from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route 
          path="/dashboard"
          element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
          }
        />
        <Route 
          path="/forms" 
          element={
            <ProtectedRoute>
              <FormBuilder />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}