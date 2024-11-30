import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const ProtectedRoute = () => {
  const { currentUser, isOtpVerified, loading } = useContext(AuthContext);
  const location = useLocation();

  // Prevent rendering or navigation during loading state
  if (loading) {
    return null;
  }

  // Redirect to login if the user is not authenticated or OTP is not verified
  if (!currentUser || !isOtpVerified) {
    if (location.pathname !== "/login") {
      return <Navigate to="/login" replace state={{ from: location }} />;
    }
    return null; // Avoids unnecessary renders
  }

  // Redirect to profile based on userType
  const { userType, isVerified } = currentUser;

  // Restrict access based on path and userType
  // Conditional redirection logic based on user type
  if (location.pathname.startsWith("/u/") && userType !== "Patient") {
    if (location.pathname !== "/d/profile") {
      return <Navigate to="/d/profile" replace />;
    }
    return null;
  }

  if (location.pathname.startsWith("/d/")) {
    if (userType !== "Dermatologist") {
      if (location.pathname !== "/u/profile") {
        return <Navigate to="/u/profile" replace />;
      }
      return null;
    }

    if (!isVerified && location.pathname !== "/d/verify") {
      return <Navigate to="/d/verify" replace />;
    }
  }

  if (location.pathname.startsWith("/a/") && userType !== "Admin") {
    if (location.pathname !== "/a/accounts") {
      return <Navigate to="/status/403" replace />;
    }
    if (userType === "Admin" && !location.pathname.startsWith("/a/")) {
      return <Navigate to="/a/accounts" replace />;
    }

    return null;
  }

  return <Outlet />;
};

export default ProtectedRoute;
