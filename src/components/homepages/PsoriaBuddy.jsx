// Styles
import "../../styles/psoriabuddy.css";
// Assets
import laptop1 from "../../assets/homepage/laptop1.png";
import laptop2 from "../../assets/homepage/laptop2.png";
//  React Hooks
import { useNavigate } from "react-router-dom";
//  Firebase
import { getAuth } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
//  Ant Components
import { message } from "antd";

const PsoriaBuddy = () => {
  // Initialize useNavigate
  const navigate = useNavigate();
  // Initialize Firebase Auth
  const auth = getAuth();
  // Get the current logged-in user
  const currentUser = auth.currentUser;

  //  Get userType from database
  const fetchUserType = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      return userDoc.exists() ? userDoc.data().userType : null;
    } catch (error) {
      console.error("Error fetching user type:", error);
      return null;
    }
  };

  //  Handles Explore Now
  const handleExploreNow = async () => {
    if (currentUser) {
      const userType = await fetchUserType(currentUser.uid);
      if (userType === "Patient") {
        navigate("/u/profile");
      } else if (userType === "Dermatologist") {
        navigate("/d/profile");
      } else if (userType === "Admin") {
        navigate("/a/accounts");
      } else {
        message.error("Unknown user type");
      }
    } else {
      message.error("Oops! Please log in your account!");
      navigate("/login");
    }
  };

  return (
    <>
      <div id="psoriabuddy" className="psoriabuddy-container">
        <div className="psoriabuddy-content">
          <div className="psoriabuddy-text-content">
            <div className="psoriabuddy-text">
              <h1>PsoriaBuddy</h1>
              <p>
                We offer a personalized, easy-to-use platform to help you assess
                your symptoms and manage your psoriasis.
              </p>
            </div>
            <div className="psoriabuddy-explorenow-button">
              <button onClick={handleExploreNow}>Explore Now</button>
            </div>
          </div>

          <div className="psoriabuddy-images">
            <div className="psoriabuddy-image1">
              <img src={laptop2} alt="Laptop1" />
            </div>
            <div className="psoriabuddy-image2">
              <img src={laptop1} alt="Laptop2" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PsoriaBuddy;
