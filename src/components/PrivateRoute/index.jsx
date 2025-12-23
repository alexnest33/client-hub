import { Navigate } from "react-router";
import { Outlet } from "react-router";


const PrivateRoute = () => {
    
    const isAuth = localStorage.getItem("token") // возможно заиспользовать стор для хранения токена 
    return isAuth ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
