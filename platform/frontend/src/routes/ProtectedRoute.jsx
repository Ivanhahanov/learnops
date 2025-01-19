import { Navigate } from "react-router-dom";
import { useAuth } from "../context/OAuthContext";

const ProtectedRoute = ({children, redirectPath = '/login'}) => {
    const { user, loading } = useAuth()
    
    if (loading) {
        return <div>Loading...</div>;
      }
      console.log(user, loading)
    if (!user) {
        return <Navigate to={redirectPath} replace />;
    }

    return children;
};

export default ProtectedRoute;