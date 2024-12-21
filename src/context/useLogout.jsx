import { auth, db } from "../../firebaseConfig";
import { signOut } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { message } from "antd";

const useLogout = () => {
  const { setCurrentUser, setIsOtpVerified } = useContext(AuthContext);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      const user = auth.currentUser;

      if (user) {
        // Reset OTP verification status in Firestore
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { isOtpVerified: false }, { merge: true });
      }

      // Sign out from Firebase
      await signOut(auth);

      // Reset application state
      setCurrentUser(null);
      setIsOtpVerified(false);

      // Clear browser state storage
      localStorage.removeItem("isOtpVerified");
      sessionStorage.clear();

      // Navigate to Login and prevent back button
      navigate("/", { replace: true, state: { resetOtpStage: true } });

      // Show success message
      message.success("Logged out successfully.");
    } catch (error) {
      console.error("Logout error:", error);
      message.error("Failed to log out. Please try again.");
    }
  };

  return { logout };
};

export default useLogout;
