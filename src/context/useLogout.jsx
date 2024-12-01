import { auth, db } from "../../firebaseConfig";
import {
  setPersistence,
  browserLocalPersistence,
  signOut,
} from "firebase/auth";
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
        const userRef = doc(db, "users", user.uid);

        await setDoc(userRef, { isOtpVerified: false }, { merge: true });
      }

      // Clear persistence before signing out
      await setPersistence(auth, browserLocalPersistence);
      await signOut(auth);

      // Reset states and navigate to login
      setCurrentUser(null);
      setIsOtpVerified(false);
      navigate("/login");

      message.success("You have logged out successfully.");
    } catch (error) {
      console.error("Logout error:", error);
      message.error("Failed to log out. Please try again.");
    }
  };

  return { logout };
};

export default useLogout;
