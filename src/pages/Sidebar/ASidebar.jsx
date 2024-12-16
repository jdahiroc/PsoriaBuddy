import "../../styles/Sidebar/asidebar.css";

import { Link } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

import useLogout from "../../context/useLogout";
import { useEffect, useState, useContext } from "react";

import profileicon from "../../assets/patient/profile-icon.png";
import eventsicon from "../../assets/patient/events-icon.png";
import logouticon from "../../assets/patient/logout-icon.png";
import avatar from "../../assets/patient/avatar.png";

const ASidebar = () => {
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
      <div className="asidebar-container">
        <div className="asidebar-content">
          {/* heading */}
          {user && (
            <div className="asidebar-profile">
              <div className="asidebar-avatar">
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
              <div className="asidebar-username">
                <h3>
                  {user.fullName} <br />
                  <sub
                    style={{
                      fontSize: "12px",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: "400",
                      display: "flex",
                      justifyContent: "center",
                      paddingTop: "5px",
                    }}
                  >
                    {user.userType || "Loading..."}
                  </sub>
                </h3>
              </div>
            </div>
          )}
          {/* navigations */}
          <div className="asidebar-nav-naviations">
            <div className="asidebar-nav-profile">
              <Link to="/a/accounts">
                <img src={profileicon} alt="accounts" />
                Accounts
              </Link>
            </div>
            <div className="asidebar-nav-appointment">
              <Link to="/a/events">
                <img src={eventsicon} alt="events" />
                Events
              </Link>
            </div>
          </div>
          {/* logout navigations */}
          <div className="alogout-nav-container">
            <div className="alogout-nav-content">
              <div className="dsidebar-nav-homepage">
                <Link to="/">Go to homepage</Link>
              </div>
              <div className="asidebar-nav-logout">
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

export default ASidebar;
