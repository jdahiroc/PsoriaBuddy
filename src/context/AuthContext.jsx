// React Hooks
import React, { createContext, useState, useEffect } from "react";
// Firebase Hooks
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Initialize Firestore instance
export const db = getFirestore();

// Create the authentication context to provide global auth state
export const AuthContext = createContext();

// Create the authentication provider to manage auth state
export const AuthProvider = ({ children }) => {
  // State to store the current user object
  const [currentUser, setCurrentUser] = useState(null);

  // State to store OTP verification status, using localStorage to persist it
  const [isOtpVerified, setIsOtpVerified] = useState(
    localStorage.getItem("isOtpVerified") === "true"
  );

  // Loading state to manage authentication status check process
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      await auth.signOut();
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
      throw error;
    }
  };

  // useEffect hook to handle user authentication state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);
          const userData = userSnap.exists() ? userSnap.data() : {};

          const otpVerified = userData.isOtpVerified || false;
          localStorage.setItem("isOtpVerified", otpVerified ? "true" : "false");

          setCurrentUser((prevUser) => {
            if (!prevUser || prevUser.uid !== user.uid) {
              return { ...user, ...userData };
            }
            return prevUser;
          });

          setIsOtpVerified(otpVerified);
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setCurrentUser(null);
        setIsOtpVerified(false);
        localStorage.removeItem("isOtpVerified");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Provide the auth state values to children components via AuthContext.Provider
  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isOtpVerified,
        setIsOtpVerified,
        loading,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
