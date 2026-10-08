import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('@AtletaCheckin:token');
    const user = JSON.parse(localStorage.getItem('@AtletaCheckin:user') || '{}');

    if (!token || user.role !== 'COACH') {
        if ( user.role === 'ATHLETE') {
            return <Navigate to="/checkin" replace />
        } else {            
            return <Navigate to="/login" replace />
        }
    }
    return children;
};