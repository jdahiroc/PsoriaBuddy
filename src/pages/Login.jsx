// React Component
import { useState, useContext, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
// Emailjs
import emailjs from "@emailjs/browser";
// MUI Components and Icons
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
// Assets
import loginbg from "../assets/background/loginbg.png";
import logo from "../assets/background/PsoriaBuddy.png";
// Ant Design Components
import { Spin, message } from "antd";
// Firebase Configurations
import {
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../firebaseConfig";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
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

const LoginWithOtpVerification = () => {
  // State Variables
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPassword, setPatientPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOtpStage, setIsOtpStage] = useState(false);

  // OTP resend logic
  const [resendTimer, setResendTimer] = useState(60); // Timer for OTP resend
  const [canResend, setCanResend] = useState(false); // Resend button enabled/disabled state

  // Ant Design message component for notifications
  const [messageApi, contextHolder] = message.useMessage();
  // This will fix the ant message WARNING!
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [messageType, setMessageType] = useState(null);

  // Access AuthContext for authentication-related data and functions
  const { isOtpVerified, setIsOtpVerified, currentUser, setCurrentUser } =
    useContext(AuthContext);

  // React Router's navigation hook
  const location = useLocation();
  const navigate = useNavigate();

  // Reset OTP stage if redirected from logout
  useEffect(() => {
    if (location.state?.resetOtpStage) {
      setIsOtpStage(false); // Reset the OTP stage
    }
  }, [location]);

  // Navigates users based on their userType and verification status after OTP verification
  useEffect(() => {
    if (isOtpVerified && currentUser) {
      // Initialize currentUsers
      const { userType, isVerified } = currentUser;
      if (userType === "Patient") {
        // Default patient path
        location("/u/profile", { replace: true });
      } else if (userType === "Dermatologist") {
        location(isVerified ? "/d/profile" : "/d/verify", {
          // Default derma path
          replace: true,
        });
      } else if (userType === "Admin") {
        location("/a/dashboard", { replace: true }); // Default admin path
      }
    }
  }, [isOtpVerified, currentUser, location]);

  // Starts countdown for OTP resend functionality
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval); // Cleanup timer on component unmount
    } else {
      setCanResend(true); // Enable resend button when timer reaches 0
    }
  }, [resendTimer]);

  // Displays notifications using Ant Design message component
  useEffect(() => {
    if (notificationMessage) {
      message[messageType](notificationMessage);
      setNotificationMessage(null);
    }
  }, [notificationMessage, messageType]);

  // Handles the login process and transitions to OTP stage
  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        patientEmail,
        patientPassword
      );
      const user = userCredential.user;

      if (!user.emailVerified) {
        setMessageType("error");
        setNotificationMessage(
          "Verify your email via the link in your inbox before logging in."
        );
        setIsLoading(false);
        return;
      }

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();

        // Check if the user is already OTP verified
        if (userData.isOtpVerified) {
          setIsOtpVerified(true);
          setCurrentUser({ ...user, ...userData });
          return;
        }

        // Generate and send OTP
        const otpCode = generateOtp();
        await setDoc(
          userRef,
          { otp: otpCode, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) },
          { merge: true }
        );
        await sendEmailWithOtp(patientEmail, otpCode);

        // Show success message and set OTP stage
        setMessageType("success");
        setNotificationMessage("OTP has been sent to your email address.");
        setIsOtpStage(true); // Ensure transition to OTP stage happens here
      } else {
        setMessageType("error");
        setNotificationMessage("User data not found in Firestore.");
      }
    } catch (error) {
      setMessageType("error");
      setNotificationMessage(
        "Failed to log in. Please check your credentials."
      );
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handles OTP verification process
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        const savedOtp = String(userData.otp);
        const expirationDate = userData.otpExpiresAt.toDate();

        if (String(otp) === savedOtp && expirationDate > new Date()) {
          await setDoc(userRef, { isOtpVerified: true }, { merge: true });
          setIsOtpVerified(true); // Mark as verified only after correct OTP
          setMessageType("success");
          setNotificationMessage("OTP Verified Successfully!");
        } else {
          setMessageType("error");
          setNotificationMessage("Invalid OTP or OTP expired.");
        }
      } else {
        setMessageType("error");
        setNotificationMessage("User data not found.");
      }
    } catch (error) {
      setMessageType("error");
      setNotificationMessage("An error occurred during OTP verification.");
    } finally {
      setIsLoading(false);
    }
  };

  // Handles OTP resend functionality
  const handleResendOtp = async () => {
    if (canResend) {
      setIsLoading(true);
      try {
        const otpCode = generateOtp(); // Generate new OTP
        const userRef = doc(db, "users", auth.currentUser.uid);

        // Save new OTP to Firestore
        await setDoc(
          userRef,
          { otp: otpCode, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000) },
          { merge: true }
        );

        // Send new OTP to user's email
        await sendEmailWithOtp(patientEmail, otpCode);
        // Reset timer to 60 seconds
        setResendTimer(60);
        // Disable resend button
        setCanResend(false);
        // Show success message
        setMessageType("success");
        setNotificationMessage("A new OTP has been sent to your email.");
      } catch (error) {
        setMessageType("error");
        setNotificationMessage("Failed to resend OTP. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
      {contextHolder}
      <img className="loginbg" src={loginbg} alt="background" />
      <div className="login-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            isOtpStage ? handleVerifyOtp(e) : handleLogin(e);
          }}
        >
          <Card
            sx={{
              height: isOtpStage ? 550 : 610,
              maxWidth: 400,
              backgroundColor: "#51829B",
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CardContent
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
              }}
            >
              <img
                className="logo"
                src={logo}
                alt="Descriptive Alt Text"
                style={{
                  width: "100%",
                  height: "auto",
                  marginTop: "10px",
                  marginBottom: "10px",
                }}
              />
              {!isOtpStage ? (
                // Login Stage
                <>
                  <TextField
                    label="Email"
                    variant="outlined"
                    value={patientEmail}
                    onChange={(e) => setPatientEmail(e.target.value)}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ style: { color: "#393939" } }}
                    InputProps={{
                      style: {
                        color: "#393939",
                        backgroundColor: "#FFFFFF",
                        borderRadius: 8,
                        fontFamily: "'Inter', sans-serif",
                      },
                    }}
                    sx={{
                      width: "300px",
                      fontWeight: 500,
                    }}
                  />
                  <TextField
                    label="Password"
                    variant="outlined"
                    value={patientPassword}
                    onChange={(e) => setPatientPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    fullWidth
                    margin="normal"
                    InputLabelProps={{ style: { color: "#393939" } }}
                    InputProps={{
                      style: {
                        color: "#393939",
                        backgroundColor: "#FFFFFF",
                        borderRadius: 8,
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                      },
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            onMouseDown={(e) => e.preventDefault()}
                            edge="end"
                            sx={{
                              color: "#393939",
                              "&:hover": {
                                backgroundColor: "transparent",
                              },
                            }}
                          >
                            {showPassword ? (
                              <VisibilityOff fontSize="small" />
                            ) : (
                              <Visibility fontSize="small" />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      width: "300px",
                      fontWeight: 500,
                    }}
                  />
                  {/* Forgot Password Link */}
                  <Typography
                    variant="body2"
                    color="#FFFFFF"
                    align="right"
                    sx={{
                      cursor: "pointer",
                      textDecoration: "underline",
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 400,
                      alignSelf: "flex-end",
                      mr: 4,
                    }}
                    onClick={() => navigate("/forgotpassword")}
                  >
                    Forgot Password?
                  </Typography>
                </>
              ) : (
                // OTP Stage
                <>
                  <Typography
                    variant="h6"
                    align="left"
                    sx={{
                      color: "#FFFFFF",
                      fontSize: "15px",
                      fontWeight: 400,
                      mt: 2,
                      mb: 3,
                      ml: 5,
                    }}
                  >
                    We've sent a code to {auth.currentUser?.email}.
                  </Typography>
                  <TextField
                    label="Enter OTP code"
                    variant="outlined"
                    fullWidth
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    InputLabelProps={{ style: { color: "#000000" } }}
                    InputProps={{
                      style: {
                        color: "#393939",
                        backgroundColor: "#FFFFFF",
                        borderRadius: 8,
                        fontFamily: "'Inter', sans-serif",
                        fontWeight: 500,
                      },
                    }}
                    sx={{ mb: 2, width: "300px" }}
                  />
                  <Button
                    onClick={handleResendOtp}
                    disabled={!canResend}
                    sx={{
                      fontSize: "0.875rem",
                      color: "#FFFFFF",
                      textDecoration: "underline",
                      mr: "140px",
                    }}
                  >
                    Click to resend {resendTimer > 0 && `${resendTimer}s`}
                  </Button>
                </>
              )}
            </CardContent>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                padding: "10px",
              }}
            >
              <Button
                type="submit"
                size="small"
                sx={{
                  mb: 2,
                  color: "#FFFFFF",
                  backgroundColor: "#FEA66C",
                  height: "50px",
                  borderRadius: 3,
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 600,
                  fontSize: "17px",
                  width: "80%",
                  "&:hover": {
                    backgroundColor: "#F6995C",
                  },
                }}
                disabled={isLoading}
              >
                {isOtpStage ? "Verify OTP" : "Log in"}
              </Button>

              {!isOtpStage && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/signup")}
                  size="small"
                  sx={{
                    mb: 4,
                    color: "#FFFFFF",
                    backgroundColor: "#51829B",
                    border: "1px solid #FFFFFF",
                    height: "50px",
                    borderRadius: 2,
                    fontFamily: "'Inter', sans-serif",
                    fontWeight: 600,
                    fontSize: "17px",
                    width: "80%",
                    "&:hover": {
                      backgroundColor: "#51829B",
                      color: "#FFFFFF",
                      border: "none",
                    },
                  }}
                >
                  Create Account
                </Button>
              )}
            </div>
          </Card>
        </form>
      </div>
      {isLoading && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Spin fullscreen />
        </div>
      )}
    </>
  );
};

export default LoginWithOtpVerification;
