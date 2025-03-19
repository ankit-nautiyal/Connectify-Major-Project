import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const withAuth = (WrappedComponent) => {
    const AuthComponent = (props) => {
        const routeTo = useNavigate();
        const location = useLocation(); // to get the current path

        const isAuthenticated = () => {
            if(localStorage.getItem("token")) {
                return true;
            } 
            return false; 
        }

        useEffect(() => {
            const isGuestMeeting = location.pathname === "/guest"; // Check if path is "/guest"
            if(!isAuthenticated() && !isGuestMeeting) {
                routeTo("/auth")
            }
        }, [location.pathname]) // Re-run effect if path changes

        return <WrappedComponent {...props} />
    }
    return AuthComponent;
}

export default withAuth;