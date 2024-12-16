// Styles
import "../../styles/navbar.css";
// Assets
import PsoriaBuddyLogo from "../../assets/background/PsoriaBuddyLogoBanner.png";
import PsoriaBuddyMini from "../../assets/background/PsoriaBuddyMini.png";
import EventIcon from "../../assets/background/events-icon.png";
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
import { Divider, Modal, Card, message } from "antd";
// Day.js for Date Formatting
import dayjs from "dayjs";

const Navbar = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();

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

  // Event States
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [events, setEvents] = useState([]);

  const showEventModal = () => {
    setIsEventModalOpen(true);
  };

  const handleEventCancel = () => {
    setIsEventModalOpen(false);
  };

  // Fetch Events in Real-Time from Firestore
  useEffect(() => {
    const eventsCollectionRef = collection(db, "events");

    // Real-time listener for events
    const unsubscribe = onSnapshot(eventsCollectionRef, (snapshot) => {
      const fetchedEvents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEvents(fetchedEvents);
    });

    // Cleanup listener on component unmount
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
        autoHideDuration={6000}
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
          <p>No events available.</p>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="modal-card">
              <img src={PsoriaBuddyMini} alt="PsoriaBuddyMini" />
              <p className="bold-inter">{event.title}</p>
              <p className="regular-inter">{event.description}</p>
              <p className="semibold-inter1">WHERE: {event.location}</p>
              <p className="semibold-inter2">
                WHEN: {dayjs(event.date).format("MMMM D, YYYY")} @ {event.time}
              </p>
              <button
                onClick={() => {
                  if (event.link) {
                    window.open(event.link, "_blank", "noopener,noreferrer");
                  } else {
                    message.warning("No link available for this event.");
                  }
                }}
              >
                Learn More
              </button>
            </Card>
          ))
        )}
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
            <img src={EventIcon} alt="Events" />
          </div>

          {!currentUser ? (
            <>
              <div className="navbar-login-button">
                <Link to="/login">Login</Link>
              </div>
              <div className="navbar-signup-button">
                <Link to="/signup">Sign up</Link>
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
                  Hello, <span>{userDetails.fullName || "Loading..."}</span>
                </p>
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
                <div
                  style={{ paddingLeft: 15, paddingRight: 15 }}
                  className="profile-menu-divider"
                >
                  <Divider style={{ borderColor: "#0B0B0C", opacity: "10%" }} />
                </div>
                <MenuItem
                  style={{
                    fontFamily: "Inter, sans-serif",
                    paddingBottom: "5px",
                    display: "flex",
                    justifyContent: "center",
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
                    : "Profile"}
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
              </Menu>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
