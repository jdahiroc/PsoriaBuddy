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
        const userRef = doc(db, "users", user.uid);
        await setDoc(userRef, { isOtpVerified: false }, { merge: true });
      }

      await signOut(auth);

      setCurrentUser(null);
      setIsOtpVerified(false);
      localStorage.removeItem("isOtpVerified");
      sessionStorage.clear();

      navigate("/", { replace: true, state: { resetOtpStage: true } });

      message.success("Logged out successfully.");
    } catch (error) {
      console.error("Logout error:", error);
      if (error.code === "permission-denied") {
        message.error("Permission denied. Contact support.");
      } else {
        message.error("Failed to log out. Please try again.");
      }
    }
  };

  return { logout };
};

export default useLogout;
