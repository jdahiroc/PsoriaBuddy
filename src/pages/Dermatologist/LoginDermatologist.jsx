// CSS
import "../../css/logindermatologist.css";

// React and Hooks
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// Emailjs
import emailjs from "@emailjs/browser";

// Firebase
import { auth } from "../../../firebaseConfig";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import {
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// Assets
import appLogo from "../../assets/background/Psoriasis Logo.png";

// Ant Design
import { Divider, message, Spin } from "antd";
import { GoogleOutlined } from "@ant-design/icons";

// MUI Components
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";

// Initialize Firestore
const db = getFirestore();

// Function that generates a 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// Initialize Emailjs
const sendEmailWithOtp = async (email, otp) => {
  try {
    const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateID = import.meta.env.VITE_EMAILJS_OTP_TEMPLATE_ID;
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    const templateParams = {
      to_email: email,
      otp_code: otp,
    };

    // Access the emailjs configuration
    await emailjs.send(serviceID, templateID, templateParams, publicKey);
  } catch (error) {
    console.error("Error sending email with OTP:", error);
    throw new Error("Failed to send OTP email.");
  }
};

// Reusable Notification Hook
const useNotification = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const showNotification = (type, msg) => {
    messageApi[type](msg);
  };

  return { showNotification, contextHolder };
};

// OTP Form Component
const OtpForm = ({
  otp,
  onOtpChange,
  onResend,
  resendTimer,
  canResend,
  isLoading,
  onVerify,
}) => {
  return (
    <>
      <TextField
        label="Enter OTP"
        variant="outlined"
        fullWidth
        value={otp}
        onChange={onOtpChange}
        style={{ marginBottom: "1rem" }}
      />
      <Button
        onClick={onResend}
        disabled={!canResend}
        style={{ marginBottom: "1rem", color: "#007bff" }}
      >
        Resend OTP {resendTimer > 0 && `(${resendTimer}s)`}
      </Button>
      <Button
        onClick={onVerify}
        disabled={isLoading}
        variant="contained"
        color="primary"
      >
        Verify OTP
      </Button>
    </>
  );
};

// Login Form Component
const LoginForm = ({
  email,
  password,
  showPassword,
  setEmail,
  setPassword,
  togglePasswordVisibility,
  onLogin,
  isLoading,
}) => {
  return (
    <>
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: "1rem" }}
      />
      <TextField
        label="Password"
        variant="outlined"
        fullWidth
        type={showPassword ? "text" : "password"}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={togglePasswordVisibility}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        style={{ marginBottom: "1rem" }}
      />
      {/* Forgot Password */}
      <div className="derma-login-forgotpassword">
        <Link to="/forgotpassword">
          <p>Forgot Password?</p>
        </Link>
      </div>
      <div className="derma-login-buttons">
        <div className="derma-login-button">
          <button onClick={onLogin} disabled={isLoading}>
            Login
          </button>
        </div>
        <div className="derma-createaccount-button">
          <Link to="/d/signup">
            <button>Create Account</button>
          </Link>
        </div>
      </div>
    </>
  );
};

const LoginDermatologist = () => {
  const [dermatologistEmail, setDermatologistEmail] = useState("");
  const [dermatologistPassword, setDermatologistPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isOtpStage, setIsOtpStage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const { showNotification, contextHolder } = useNotification();
  const { isOtpVerified, setIsOtpVerified, currentUser, setCurrentUser } =
    useContext(AuthContext);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state?.resetOtpStage) {
      setIsOtpStage(false);
      setOtp("");
    }
  }, [location]);

  useEffect(() => {
    if (isOtpVerified && currentUser) {
      navigate("/d/profile", { replace: true });
      const { userType, isVerified } = currentUser;
      if (!isOtpStage) {
        if (userType === "Dermatologist") {
          navigate(isVerified ? "/d/profile" : "/d/verification", {
            replace: true,
          });
        } else {
          navigate("/", { replace: true });
        }
      }
    }
  }, [isOtpVerified, currentUser, navigate, isOtpStage]);

  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  // Handle the Google Login Function
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();

    try {
      setIsLoading(true);
      message.loading({
        content: "Connecting with Google...",
        key: "googleLogin",
      });

      // Trigger Google Login with Popup
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Fetch or create user data in Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      let userData;

      if (userSnap.exists()) {
        userData = userSnap.data();
        // updates the isOtpVerified every user login, if account exists
        await updateDoc(userRef, { isOtpVerified: true });

      } else {
        userData = {
          email: user.email,
          fullName: user.displayName || "Google User",
          uid: user.uid,
          isVerified: false,
          isOtpVerified: true, // Automatically verified for Google users
          createdAt: new Date(),
          userType: "Dermatologist", // Default to Dermatologist
        };
        await setDoc(
          userRef,
          userData,
          { isOtpVerified: true },
          { merge: true }
        );
      }

      // Ensure `isOtpVerified` is not overwritten if the account exists
      const isOtpVerified = userSnap.exists() ? userData.isOtpVerified : true;

      // Validate userType
      const { userType } = userData;
      if (userType !== "Dermatologist" && userType !== "Admin") {
        message.warning(
          "Login process stopped. Account type is not Dermatologist. "
        );
        setIsLoading(false);
        // Immediately log out the user
        await signOut(auth);
        return; // Stop login process
      }

      // Proceed with login
      setCurrentUser({
        ...user,
        ...userData,
        isOtpVerified: true,
      });
      setIsOtpVerified(true);

      // Shows the message
      message.success({
        content: "Google Login Successful!",
        key: "googleLogin",
      });

      // Redirect based on userType
      if (userType === "Dermatologist") {
        navigate("/d/profile", { replace: true });
      } else if (userType === "Admin") {
        navigate("/a/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Google Login Failed:", error.message);
      message.error({
        content: `Google Login Failed: ${error.message}`,
        key: "googleLogin",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handles Email & Password Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(
        auth,
        dermatologistEmail,
        dermatologistPassword
      );

      // Initialize user
      const user = userCredential.user;

      // Check email verification
      if (!user.emailVerified) {
        showNotification("error", "Verify your email before logging in.");
        setIsLoading(false);
        return;
      }

      // Fetch user data from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const { userType } = userData;

        // Validate userType
        if (userType !== "Dermatologist" && userType !== "Admin") {
          message.warning(
            "Login process stopped. Account type is not Dermatologist. "
          );
          setIsLoading(false);
          // Immediately log out the user
          await signOut(auth);
          return; // Stop login process
        }

        // Validate userType
        if (userType !== "Dermatologist" && userType !== "Admin") {
          showNotification(
            "warning",
            "Login process stopped. Account type is not Dermatologist. "
          );
          setIsLoading(false);
          return; // Stop login process
        }

        // Proceed with OTP verification
        if (userData.isOtpVerified) {
          setIsOtpVerified(true);
          setCurrentUser({ ...user, ...userData });
          navigate(
            userType === "Dermatologist" ? "/d/profile" : "/a/dashboard",
            { replace: true }
          );
        } else {
          const otpCode = generateOtp();
          await setDoc(
            userRef,
            {
              otp: otpCode,
              otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
            },
            { merge: true }
          );
          await sendEmailWithOtp(user.email, otpCode);
          setIsOtpStage(true);
          showNotification("success", "OTP sent to your email.");
        }
      } else {
        showNotification("error", "User data not found.");
      }
    } catch (error) {
      showNotification(
        "error",
        "Login failed. Check your credentials or create an account!"
      );
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Initialize userRef & userSnap
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      // Checks user if the currentUser exists
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const savedOtp = String(userData.otp);
        const expirationDate = userData.otpExpiresAt.toDate();

        if (String(otp) === savedOtp && expirationDate > new Date()) {
          // Update Firestore document
          await setDoc(userRef, { isOtpVerified: true }, { merge: true });

          // Update current user in context
          setCurrentUser((prevUser) => ({
            ...prevUser,
            isOtpVerified: true,
          }));

          // Directly set OTP verification in local storage
          localStorage.setItem("isOtpVerified", "true");

          setIsOtpVerified(true);
          showNotification("success", "OTP Verified Successfully!");
        } else {
          showNotification("error", "Invalid OTP or OTP expired.");
        }
      } else {
        showNotification("error", "User data not found.");
      }
    } catch (error) {
      showNotification("error", "Error verifying OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (canResend) {
      setIsLoading(true);
      try {
        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const userRef = doc(db, "users", auth.currentUser.uid);

        // Save new OTP to Firestore
        await setDoc(
          userRef,
          { otp: otpCode, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) },
          { merge: true }
        );

        // Send new OTP to user's email
        await sendEmailWithOtp(patientEmail, otpCode);
        // Show success message
        showNotification("success", "OTP resent to your email.");
        // Reset timer to 60 seconds
        setResendTimer(60);
        // Disable resend button
        setCanResend(false);
      } catch (error) {
        showNotification("error", "Failed to resend OTP.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      {contextHolder}
      <div className="derma-container">
        <div className="derma-login-contents">
          <div className="derma-login-left-section">
            <img src={appLogo} alt="logo" className="derma-login-logo" />
          </div>
          <div className="derma-login-right-header">
            <p>Login</p>
            {/* Sub-heading */}
            <div className="derma-login-right-subheader">
              <p>Welcome back! You will login as Dermatologist.</p>
            </div>
            {isOtpStage ? (
              <OtpForm
                otp={otp}
                onOtpChange={(e) => setOtp(e.target.value)}
                onResend={handleResendOtp}
                resendTimer={resendTimer}
                canResend={canResend}
                isLoading={isLoading}
                onVerify={handleVerifyOtp}
              />
            ) : (
              <LoginForm
                email={dermatologistEmail}
                password={dermatologistPassword}
                showPassword={showPassword}
                setEmail={setDermatologistEmail}
                setPassword={setDermatologistPassword}
                togglePasswordVisibility={() => setShowPassword(!showPassword)}
                onLogin={handleLogin}
                isLoading={isLoading}
              />
            )}
            {/* Divider */}
            <Divider
              plain
              style={{
                borderColor: "#393939",
                opacity: "60%",
              }}
            >
              OR CONTINUE WITH
            </Divider>
            {/* Google Login Button */}
            <div className="derma-google-login">
              <button onClick={handleGoogleLogin}>
                <div className="derma-google-icon">
                  <GoogleOutlined
                    style={{ paddingRight: 2, fontSize: "20px" }}
                  />
                </div>
                CONNECT WITH GOOGLE
              </button>
            </div>
          </div>
        </div>
      </div>
      {isLoading && <Spin size="large" className="loading-spinner" />}
    </>
  );
};

export default LoginDermatologist;
