import React, { createContext, useState, useEffect } from "react";
import { auth } from "../../firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

export const db = getFirestore();
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [loading, setLoading] = useState(true);

  const logout = async () => {
    try {
      setLoading(true);

      // Clear current user state before signOut
      setCurrentUser(null);
      setIsOtpVerified(false);

      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleAuthChange = async (user) => {
      setLoading(true);

      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            const otpVerified = userData.isOtpVerified === true;

            setCurrentUser({
              ...user,
              ...userData,
              isOtpVerified: otpVerified,
            });
            setIsOtpVerified(otpVerified);
          } else {
            console.warn("No user document found in Firestore.");
            setCurrentUser(null);
            setIsOtpVerified(false); // Reset if no document is found
          }
        } catch (error) {
          if (error.code === "permission-denied") {
            console.error("Firestore permission denied. Check security rules.");
          } else {
            console.error("Error fetching user data:", error);
          }
        }
      } else {
        setCurrentUser(null);
        setIsOtpVerified(false);
      }

      setLoading(false);
    };

    const unsubscribe = onAuthStateChanged(auth, handleAuthChange);

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
      setCurrentUser(null);
      setIsOtpVerified(false);
    };
  }, []);

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
