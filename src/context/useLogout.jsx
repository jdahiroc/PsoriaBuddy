// Firebase Configs
import { signOut } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
// React Hooks
import { useNavigate } from "react-router-dom";
import { useContext } from "react"; // For accessing context in React
// Authentication Context (User Objects and OTP Verification Status)
import { AuthContext } from "../context/AuthContext";
// Ant Design Components
import { message } from "antd";

const useLogout = () => {
  const { setCurrentUser, setIsOtpVerified } = useContext(AuthContext);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const user = auth.currentUser; // Get the currently logged-in user

      if (user) {
        const userRef = doc(db, "users", user.uid);

        // Update isOtpVerified to false in Firestore
        await setDoc(userRef, { isOtpVerified: false }, { merge: true });
      }

      // Sign out the user from Firebase Authentication
      await signOut(auth);

      // Clear localStorage and reset context states
      localStorage.removeItem("isOtpVerified");
      setCurrentUser(null);
      setIsOtpVerified(false);

      // Redirect the user to the login page
      navigate("/login");

      message.success("You have logged out successfully.");
    } catch (error) {
      message.error("Failed to log out. Please try again.");
      console.error("Logout error:", error);
    }
  };

  return { logout };
};

export default useLogout;
