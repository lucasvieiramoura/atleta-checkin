import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('@AtletaCheckin:token');
    const user = JSON.parse(localStorage.getItem('@AtletaCheckin:user') || '{}');

    if (!token || user.json !== 'COACH') {
        return <Navigate to="/" replace />
    }
    return children;
};