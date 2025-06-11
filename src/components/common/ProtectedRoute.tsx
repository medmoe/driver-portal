import {Navigate, Outlet, useLocation} from 'react-router-dom';
import useAuthStore from "../../stores/useAuthStore.ts";

const ProtectedRoute = () => {
    const {auth} = useAuthStore();
    const location = useLocation();

    if (!auth.isAuthenticated) {
        return <Navigate to="/" state={{from: location.pathname}} replace/>;
    }
    return <Outlet/>;

}

export default ProtectedRoute;