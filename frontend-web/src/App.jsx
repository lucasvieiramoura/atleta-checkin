import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Header from "./components/Header";
import Login from './pages/Login';
import RegisterAthlete from './pages/RegisterAthlete';
import EditWorkouts from './pages/EditWorkouts';
import EditForms from './pages/EditForms';
import Dashboard from './pages/Dashboard';
import DashboardMetrics from './pages/DashboardMetrics';
import FormBuilder from './pages/FormBuilder';
import { ProtectedRoute } from "./components/ProtectedRoute";

const Layout = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100">
      {!isLoginPage &&  <Header />}
      <main className="container mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

// Middleware de Proteção de Rota
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('@AtletaCheckin:token');
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/coach/register-athlete" element={<PrivateRoute> <ProtectedRoute> <RegisterAthlete /> </ProtectedRoute> </PrivateRoute>} />
          <Route path="/coach/workouts" element={<PrivateRoute>    <ProtectedRoute> <EditWorkouts /> </ProtectedRoute></PrivateRoute>} />
          <Route path="/coach/forms" element={<PrivateRoute> <ProtectedRoute> <EditForms /> </ProtectedRoute></PrivateRoute>} />
          <Route path="/coach/metrics" element={<PrivateRoute> <ProtectedRoute> <DashboardMetrics /> </ProtectedRoute> </PrivateRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}