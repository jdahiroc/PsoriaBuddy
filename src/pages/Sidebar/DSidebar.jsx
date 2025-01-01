// CSS for Sidebar
import "../../styles/Sidebar/dsidebar.css";
// React Hooks
import { Link } from "react-router-dom";
// Auth Context get current user
import { AuthContext } from "../../context/AuthContext";
// Assets
import profileicon from "../../assets/patient/profile-icon.png";
import appointmenticon from "../../assets/patient/appointment-icon.png";
import videocallicon from "../../assets/patient/videocall-icon.png";
import logouticon from "../../assets/patient/logout-icon.png";
import avatar from "../../assets/patient/avatar.png";
// Firebase Hooks
import useLogout from "../../context/useLogout";
import { useEffect, useState, useContext } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../firebaseConfig";

// MUI Components
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import PendingActionsIcon from "@mui/icons-material/PendingActions";

const Sidebar = () => {
  // Initialize the custom logout hook
  const { logout } = useLogout();
  // Initialize the AuthContext to get the current user
  const { currentUser } = useContext(AuthContext);
  // Fetch the current user data
  const [user, setUser] = useState([]);
  // Initialize showAlert from MUI Component
  const [showAlert, setShowAlert] = useState(false);

  // Real time listening to isVerified & verification
  // to update navigation button
  useEffect(() => {
    if (currentUser?.uid) {
      const userDocRef = doc(db, "users", currentUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setUser(userData);

          // Show alert if isVerified is false and verification is pending
          if (
            userData.isVerified === false &&
            userData.verification === "pending"
          ) {
            setShowAlert(true);
          } else {
            setShowAlert(false);
          }
        }
      });
      // Clean up the listener on unmount
      return () => unsubscribe();
    }
  }, [currentUser]);

  // Check if navigation buttons should be disabled
  const isNavigationDisabled = !(
    user?.isVerified === true && user?.verification === "verified"
  );

  return (
    <>
      <div className="dsidebar-container">
        <div className="dsidebar-content">
          {/* Header */}
          {user && (
            <div className="dsidebar-profile">
              <div className="dsidebar-avatar">
                <img
                  src={user?.photoURL || avatar}
                  alt="avatar"
                  style={{
                    width: "55px",
                    height: "55px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div className="dsidebar-username">
                <h3>{user.fullName}</h3>
              </div>
              <div className="dsidebar-usertype">
                <p>{user.userType || "Loading..."}</p>
              </div>
            </div>
          )}

          {/* Alert for Verification is pending */}
          {showAlert && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              Your account is not yet verified. Please wait for verification to
              be completed.
              <Button
                color="inherit"
                size="small"
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  padding: "10px",
                  marginTop: "1rem",
                  fontWeight: "600",
                  fontSize: "12px",
                }}
                component={Link}
                to="/d/verification-status"
              >
                <PendingActionsIcon style={{ marginRight: "5px" }} /> Check
                status
              </Button>
            </Alert>
          )}
          {/* Navigations */}
          <div className="dsidebar-nav-naviations">
            <div className="dsidebar-nav-profile">
              <Link to="/d/profile">
                <img src={profileicon} alt="profile" />
                Profile
              </Link>
            </div>
            <div className="dsidebar-nav-appointment">
              <Link
                to="/d/appointment"
                className={isNavigationDisabled ? "disabled-link" : ""}
              >
                <img src={appointmenticon} alt="appointment" />
                Appointment
              </Link>
            </div>
            <div className="dsidebar-nav-videocall">
              <Link
                to="/d/video"
                className={isNavigationDisabled ? "disabled-link" : ""}
              >
                <img src={videocallicon} alt="videocall" />
                Video Call
              </Link>
            </div>
          </div>
          {/* logout navigations */}
          <div className="dlogout-nav-container">
            <div className="dlogout-nav-content">
              <div className="dsidebar-nav-homepage">
                <Link to="/">Go to homepage</Link>
              </div>
              <div className="dsidebar-nav-logout">
                <button onClick={logout}>
                  <img src={logouticon} alt="logout" />
                  <p>Logout</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
