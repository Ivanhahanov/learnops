import { Navigate } from "react-router-dom";
import { useAuth } from "../context/OAuthContext";

const ProtectedRoute = ({ children, redirectPath = '/' }) => {
    const { user, loading } = useAuth()

    if (loading) {
        return <div>Loading...</div>;
    }
    if (!user) {
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;