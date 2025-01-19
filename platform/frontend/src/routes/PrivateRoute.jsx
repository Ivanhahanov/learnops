import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/OAuthContext';

const PrivateRoute = ({children, ...rest}) => {
    let { user } = useAuth()
    console.log(user)
    return !user ? <Navigate to='/login'/> : children;
}

export default PrivateRoute;