// CSS for Sidebar
import "../../styles/Sidebar/sidebar.css";
// React Hooks
import { Link } from "react-router-dom";
// Auth Context get current user
import { AuthContext } from "../../context/AuthContext";
// Ant Design
import { Divider } from "antd";
// Assets
import profileicon from "../../assets/patient/profile-icon.png";
import myexperienceicon from "../../assets/patient/myexperience-icon.png";
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
      <div className="sidebar-container">
        <div className="sidebar-content">
          {/* Header */}
          {user && (
            <div className="sidebar-profile">
              <div className="sidebar-avatar">
                <img src={avatar} alt="avatar" />
              </div>
              <div className="sidebar-username">
                <h3>{user.fullName}</h3>
              </div>
            </div>
          )}
          {/* Navigations */}
          <div className="sidebar-nav-naviations">
            <div className="sidebar-nav-profile">
              <Link to="/u/profile">
                <img src={profileicon} alt="profile" />
                Profile
              </Link>
            </div>
            <div className="sidebar-nav-myexperience">
              <Link to="/u/myexperience">
                <img src={myexperienceicon} alt="myexperience" />
                My Experience
              </Link>
            </div>
            <div className="sidebar-nav-appointment">
              <Link to="/u/appointment">
                <img src={appointmenticon} alt="appointment" />
                Appointment
              </Link>
            </div>
            <div className="sidebar-nav-divider">
              <Divider />
            </div>
            <div className="sidebar-nav-videocall">
              <Link to="/u/video">
                <img src={videocallicon} alt="videocall" />
                Video Call
              </Link>
            </div>
          </div>
          {/* logout navigations */}
          <div className="logout-nav-container">
            <div className="logout-nav-content">
              <div className="sidebar-nav-homepage">
                <Link to="/">Go to homepage</Link>
              </div>
              <div className="sidebar-nav-logout">
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
