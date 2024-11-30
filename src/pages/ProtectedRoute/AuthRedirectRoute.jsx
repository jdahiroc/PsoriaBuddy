import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const AuthRedirectRoute = () => {
  const { currentUser, isOtpVerified, loading } = useContext(AuthContext);

  if (loading) {
    return null; // Prevent rendering while loading user data
  }

  if (currentUser && isOtpVerified) {
    const { userType, isVerified } = currentUser;

    if (userType === "Patient") {
      return <Navigate to="/u/profile" replace />;
    }

    if (userType === "Dermatologist") {
      return isVerified ? (
        <Navigate to="/d/profile" replace />
      ) : (
        <Navigate to="/d/verify" replace />
      );
    }

    if (userType === "Admin") {
      return <Navigate to="/a/accounts" replace />;
    }
  }

  return <Outlet />;
};

export default AuthRedirectRoute;
