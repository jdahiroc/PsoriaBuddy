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

const Sidebar = () => {
  // Initialize the custom logout hook
  const { logout } = useLogout();
  // Initialize the AuthContext to get the current user
  const { currentUser } = useContext(AuthContext);

  // Fetch the current user data
  const [user, setUser] = useState([]);

  useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);

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
          {/* Navigations */}
          <div className="dsidebar-nav-naviations">
            <div className="dsidebar-nav-profile">
              <Link to="/d/profile">
                <img src={profileicon} alt="profile" />
                Profile
              </Link>
            </div>
            <div className="dsidebar-nav-appointment">
              <Link to="/d/appointment">
                <img src={appointmenticon} alt="appointment" />
                Appointment
              </Link>
            </div>
            <div className="dsidebar-nav-videocall">
              <Link to="/d/video">
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
