import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const ProtectedRoute = () => {
  // Fetched Auth Context current user
  const { currentUser, isOtpVerified, loading, verification } =
    useContext(AuthContext);

  // Initialize the useLocation
  const location = useLocation();

  // Prevent rendering or navigation during loading state
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Redirect to login if the user is not authenticated or OTP is not verified
  if (!currentUser || !isOtpVerified) {
    const allowedPaths = ["/login", "/signup", "/d/login", "/d/signup"];
    if (!allowedPaths.includes(location.pathname)) {
      return <Navigate to="/" replace state={{ from: location }} />;
    }
    return null; // Avoids unnecessary renders
  }

  // Redirect to profile based on userType
  const { userType, isVerified } = currentUser;

  // Checks if userType is "Patient"
  if (location.pathname.startsWith("/u/") && userType !== "Patient") {
    return <Navigate to="/d/profile" replace />;
  }

  // Checks if userType is "Dermatologist"
  if (location.pathname.startsWith("/d/") && userType !== "Dermatologist") {
    if (userType !== "Dermatologist") {
      // Restrict "Dermatologist Account Type" to access Patient Routes
      if (location.pathname !== "/u/profile") {
        return <Navigate to="/u/profile" replace />;
      }
      return null;
    }

    // Checks if account is verified
    if (!isVerified && location.pathname !== "/d/verification") {
      return <Navigate to="/d/verification" replace />;
    }

    // Redirect to verification status page if verification is "pending"
    if (
      verification === "pending" &&
      location.pathname !== "/d/verification-status"
    ) {
      return <Navigate to="/d/verification-status" replace />;
    }

    // Redirect to verification form if not verified
    if (
      verification !== "verified" &&
      location.pathname !== "/d/verification"
    ) {
      return <Navigate to="/d/verification" replace />;
    }
  }

  // Checks if userType is "Admin"
  if (location.pathname.startsWith("/a/") && userType !== "Admin") {
    return <Navigate to="/status/403" replace />;
  }

  // Allow rendering of the requested route
  return <Outlet />;
};

export default ProtectedRoute;
