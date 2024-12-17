// Styles
import "../../styles/navbar.css";
// Assets
import PsoriaBuddyLogo from "../../assets/background/PsoriaBuddyLogoBanner.png";
import PsoriaBuddyMini from "../../assets/background/PsoriaBuddyMini.png";
import EventIcon from "../../assets/background/events-icon.png";
import User from "../../assets/homepage/User.png";
// React Hooks
import { Link, useNavigate } from "react-router-dom";
// User Authentication Context
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
// Firebase Configs
import { auth, db } from "../../../firebaseConfig";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";
// MUI Components
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
// Ant Design Components
import { Divider, Modal, Card, message, Spin, FloatButton, Badge } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
// Day.js for Date Formatting
import dayjs from "dayjs";

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  // Function Modal Loader
  const [loading, setLoading] = useState(false); // Loader state

  // States for avatar menu
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // States for Snackbar Alert
  const [snackBarOpen, setSnackBarOpen] = useState(false);

  const [userDetails, setUserDetails] = useState({
    userType: "",
    username: "",
  }); // State for userType and username

  const handleSnackBarOpen = () => {
    setSnackBarOpen(true);
  };

  const handleSnackBarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackBarOpen(false);
  };

  // Select User Account for Login/Sign Up
  const [isLoginModal, setIsLoginModal] = useState(false);
  const [isSignUpModal, setIsSignUpModal] = useState(false);

  // Open Login Modal
  const showLoginModal = () => {
    setIsLoginModal(true);
  };

  const handleLoginCancel = () => {
    setIsLoginModal(false);
  };

  // Open Sign Up Modal
  const showSignUpModal = () => {
    setIsSignUpModal(true);
  };

  const handleSignUpCancel = () => {
    setIsSignUpModal(false);
  };

  // Event States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [unopenedEventsCount, setUnopenedEventsCount] = useState(0);

  const showEventModal = () => {
    setIsEventModalOpen(true);
  };

  const handleEventCancel = () => {
    setIsEventModalOpen(false);
  };

  // Function to handle navigation with delay
  const handleNavigate = (path) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate(path);
    }, 1000); // Delay of 1 second
  };

  // Fetch Events in Real-Time from Firestore
  // ------ Check which events are new/unopened and update the count. ------
  useEffect(() => {
    const eventsCollectionRef = collection(db, "events");

    const unsubscribe = onSnapshot(eventsCollectionRef, (snapshot) => {
      const fetchedEvents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter unopened events
      const unopenedEvents = fetchedEvents.filter((event) => !event.isOpened);
      setUnopenedEventsCount(unopenedEvents.length);

      setEvents(fetchedEvents);
    });

    return () => unsubscribe();
  }, []);

  // Fetch userType and username from Firestore
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserDetails({
              userType: userSnap.data().userType || "Unknown",
              fullName: userSnap.data().fullName || "Unknown",
            });
          } else {
            console.warn("No such user document found.");
            setUserDetails({ userType: "Unknown", username: "Unknown" });
          }
        } catch (error) {
          console.error("Failed to fetch user details:", error);
          setUserDetails({ userType: "Unknown", username: "Unknown" });
        }
      }
    };

    fetchUserDetails();
  }, [currentUser]);

  const handleAvatarClick = (e) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      const user = auth.currentUser; // Get the currently logged-in user
      if (user) {
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { isOtpVerified: false }, { merge: true });
      }

      await logout();
      handleSnackBarOpen();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      handleCloseMenu();
    }
  };

  const action = (
    <>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleSnackBarClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </>
  );

  return (
    <>
      <Snackbar
        open={snackBarOpen}
        autoHideDuration={3000}
        onClose={handleSnackBarClose}
        message="You have successfully logged out."
        action={action}
      />
      {/* Events Modal */}
      <Modal
        className="modal"
        open={isEventModalOpen}
        onCancel={handleEventCancel}
        footer={null}
        width={780}
      >
        <p className="modal-title">Events</p>

        {events.length === 0 ? (
          <p className="event-modal-noavailable">No events available yet.</p>
        ) : (
          events.map((event) => (
            <div key={event.id} style={{ position: "relative" }}>
              {!event.isOpened ? (
                // Render the ribbon for unopened events
                <Badge.Ribbon text="New" color="red">
                  <Card className="modal-card">
                    <img src={PsoriaBuddyMini} alt="PsoriaBuddyMini" />
                    <p className="bold-inter">{event.title}</p>
                    <p className="regular-inter">{event.description}</p>
                    <p className="semibold-inter1">WHERE: {event.location}</p>
                    <p className="semibold-inter2">
                      WHEN: {dayjs(event.date).format("MMMM D, YYYY")} @{" "}
                      {event.time}
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          const eventRef = doc(db, "events", event.id);

                          // Update Firestore document
                          await setDoc(
                            eventRef,
                            { isOpened: true },
                            { merge: true }
                          );

                          // Update local state to mark the specific event as opened
                          setEvents((prevEvents) =>
                            prevEvents.map((e) =>
                              e.id === event.id ? { ...e, isOpened: true } : e
                            )
                          );

                          // Open event link
                          if (event.link) {
                            window.open(
                              event.link,
                              "_blank",
                              "noopener,noreferrer"
                            );
                          } else {
                            message.warning(
                              "No link available for this event."
                            );
                          }
                        } catch (error) {
                          console.error("Error updating the event:", error);
                          message.error(
                            "Something went wrong while updating the event."
                          );
                        }
                      }}
                    >
                      Learn More
                    </button>
                  </Card>
                </Badge.Ribbon>
              ) : (
                // Render the card without the ribbon for opened events
                <Card className="modal-card">
                  <img src={PsoriaBuddyMini} alt="PsoriaBuddyMini" />
                  <p className="bold-inter">{event.title}</p>
                  <p className="regular-inter">{event.description}</p>
                  <p className="semibold-inter1">WHERE: {event.location}</p>
                  <p className="semibold-inter2">
                    WHEN: {dayjs(event.date).format("MMMM D, YYYY")} @{" "}
                    {event.time}
                  </p>
                  <button
                    onClick={() => {
                      if (event.link) {
                        window.open(
                          event.link,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      } else {
                        message.warning("No link available for this event.");
                      }
                    }}
                  >
                    Learn More
                  </button>
                </Card>
              )}
            </div>
          ))
        )}
      </Modal>

      {/* ------------------------ Login Modal ------------------------ */}
      <Modal
        title={
          <div
            style={{ color: "#393939", fontSize: "27px", fontWeight: "bold" }}
          >
            Login your account as...
          </div>
        }
        className="Login-modal"
        open={isLoginModal}
        onCancel={handleLoginCancel}
        footer={null}
        width={550}
      >
        <div className="login-modal-container">
          <div className="login-modal-button">
            {/* ----Patient Button---- */}
            <div
              className="login-modal-button-group"
              onClick={() => handleNavigate("/login")}
            >
              <div className="login-modal-icon">
                <img src={User} alt="user-icon" />
              </div>
              <div className="login-modal-text">
                <p>Patient</p>
              </div>
            </div>
            {/* ----Dermatologist Button---- */}
            <div
              className="login-modal-dermabutton-group"
              onClick={() => handleNavigate("/d/login")}
            >
              <div className="login-modal-icon">
                <img src={User} alt="user-icon" />
              </div>
              <div className="login-modal-text">
                <p>Dermatologist</p>
              </div>
            </div>
          </div>
          {/* Loader Display */}
          {loading && (
            <div className="loader-overlay">
              <Spin indicator={<LoadingOutlined spin />} size="large" />
            </div>
          )}
        </div>
      </Modal>

      {/* ------------------------ Sign Up Modal ------------------------ */}
      <Modal
        title={
          <div
            style={{ color: "#393939", fontSize: "27px", fontWeight: "bold" }}
          >
            Sign up your account as...
          </div>
        }
        className="SignUp-modal"
        open={isSignUpModal}
        onCancel={handleSignUpCancel}
        footer={null}
        width={580}
      >
        <div className="signUp-modal-container">
          <div className="signUp-modal-button">
            {/* ----Patient Button---- */}
            <div
              className="signUp-modal-button-group"
              onClick={() => handleNavigate("/signup")}
            >
              <div className="signUp-modal-icon">
                <img src={User} alt="user-icon" />
              </div>
              <div className="signUp-modal-text">
                <p>Patient</p>
              </div>
            </div>
            {/* ----Dermatologist Button---- */}
            <div
              className="signUp-modal-dermabutton-group"
              onClick={() => handleNavigate("/d/signup")}
            >
              <div className="signUp-modal-icon">
                <img src={User} alt="user-icon" />
              </div>
              <div className="signUp-modal-text">
                <p>Dermatologist</p>
              </div>
            </div>
          </div>

          {/* Loader Display */}
          {loading && (
            <div className="loader-overlay">
              <Spin indicator={<LoadingOutlined spin />} size="large" />
            </div>
          )}
        </div>
      </Modal>

      <div className="navbar-container">
        {/* left section */}
        <div className="navbar-leftsection-logo">
          <img src={PsoriaBuddyLogo} alt="PsoriaBuddy" />
        </div>

        {/* right section */}
        <div className="navbar-navigation-list">
          {/* event icon */}
          <div className="navbar-event-button" onClick={showEventModal}>
            <Badge
              count={
                events.filter((event) => !event.isOpened).length > 99
                  ? "99+"
                  : events.filter((event) => !event.isOpened).length
              }
              overflowCount={99}
              style={{ backgroundColor: "#f5222d", fontSize: "12px" }}
            >
              <img
                src={EventIcon}
                alt="Events"
                style={{ width: "30px", height: "30px" }}
              />
            </Badge>
          </div>

          {!currentUser ? (
            <>
              <div className="navbar-login-button">
                <button onClick={showLoginModal}>Login</button>
              </div>
              <div className="navbar-signup-button">
                <button onClick={showSignUpModal}>Sign up</button>
              </div>
              <Divider type="vertical" />
            </>
          ) : (
            <>
              <Divider type="vertical" />
              <Avatar
                onClick={handleAvatarClick}
                sx={{
                  cursor: "pointer",
                  bgcolor: currentUser.photoURL ? "transparent" : "#51829B",
                  width: 40,
                  height: 40,
                }}
                src={currentUser.photoURL || ""}
              >
                {/* Fallback to initials if no photoURL is available */}
                {!currentUser.photoURL &&
                  (currentUser.displayName
                    ? currentUser.displayName.charAt(0).toUpperCase()
                    : currentUser.email.charAt(0).toUpperCase())}
              </Avatar>

              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleCloseMenu}
                style={{ marginTop: "10px" }}
              >
                <div className="profile-menu-container">
                  <Avatar
                    sx={{
                      width: 70,
                      height: 70,
                      bgcolor: currentUser.photoURL ? "transparent" : "#51829B",
                      margin: "auto",
                      display: "flex",
                      justifyContent: "center",
                    }}
                    src={currentUser.photoURL || ""}
                  >
                    {/* Fallback to initials if no photoURL exists */}
                    {!currentUser.photoURL &&
                      (currentUser.displayName
                        ? currentUser.displayName.charAt(0).toUpperCase()
                        : currentUser.email.charAt(0).toUpperCase())}
                  </Avatar>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 700,
                      textAlign: "center",
                      margin: 4,
                      color: "#393939",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {userDetails.userType || "Loading..."}
                  </p>
                  <p
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 600,
                      fontSize: "17px",
                      textAlign: "center",
                      color: "#393939",
                      margin: 8,
                    }}
                  >
                    <span>{userDetails.fullName || "Loading..."}</span>
                  </p>
                  <h5
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                      fontSize: "14px",
                      margin: 10,
                      color: "#0B0B0C",
                      display: "flex",
                      justifyContent: "center",
                    }}
                  >
                    {currentUser.email}
                  </h5>

                  <div
                    style={{ paddingLeft: 15, paddingRight: 15 }}
                    className="profile-menu-divider"
                  >
                    <Divider
                      style={{ borderColor: "#0B0B0C", opacity: "10%" }}
                    />
                  </div>
                  <MenuItem
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontWeight: "300",
                      paddingBottom: "5px",
                      display: "flex",
                      justifyContent: "center",
                      background: "#393939",
                      backdropFilter: "transparent",
                      color: "#FFFFFF",
                      border: "#FFFFFF 1px solid",
                      borderRadius: "7px",
                    }}
                    onClick={() => {
                      const userType = userDetails.userType || "Unknown";
                      if (userType === "Admin") {
                        navigate("/a/accounts"); // Redirect to Admin Console
                      } else if (userType === "Dermatologist") {
                        navigate("/d/profile"); // Redirect to Dermatologist Profile
                      } else if (userType === "Patient") {
                        navigate("/u/profile"); // Redirect to Patient Profile
                      } else {
                        message.error("User type not recognized.");
                      }
                    }}
                  >
                    {userDetails.userType === "Admin"
                      ? "Admin Console"
                      : "View Profile"}
                  </MenuItem>
                  <MenuItem
                    style={{
                      fontFamily: "Inter, sans-serif",
                      paddingBottom: "5px",
                      display: "flex",
                      justifyContent: "center",
                      color: "#FF0000",
                    }}
                    onClick={handleLogout}
                  >
                    Logout
                  </MenuItem>
                </div>
              </Menu>
            </>
          )}
        </div>
        <FloatButton.BackTop />
      </div>
    </>
  );
};

export default Navbar;
