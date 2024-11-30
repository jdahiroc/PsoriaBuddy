// React Hooks
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// MUI Hooks
import {
  Typography,
  Button,
  Card,
  CardContent,
  TextField,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// Assets
import loginbg from "../assets/background/loginbg.png";
import image from "../assets/background/BigShoesSittingPose.png";
import loading2 from "../assets/background/LoadingOverlay2.png";
// Styles
import "../css/login.css";
// Ant Design Components
import { message } from "antd";
// Firebase Configs
import { auth } from "../../firebaseConfig";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
// Initialize Firestore
const db = getFirestore();

const OtpVerification = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationId, setVerificationId] = useState("");

  useEffect(() => {
    fetchUserPhoneNumber();
  }, []);

  const fetchUserPhoneNumber = async () => {
    try {
      setIsLoading(true);
      const user = auth.currentUser;

      if (user) {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setPhoneNumber(userData.contactNumber);
          handleSendOtp(userData.contactNumber);
        } else {
          message.error("User data not found.");
        }
      } else {
        message.error("User not logged in.");
        navigate("/login");
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user data: ", error);
      message.error("Failed to fetch user data.");
      setIsLoading(false);
    }
  };

  // handleSendOtp function
  const handleSendOtp = async (phoneNumber) => {
    try {
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(
          "recaptcha-container",
          {
            size: "invisible",
            callback: () => {
              // reCAPTCHA solved, allow OTP send
            },
          },
          auth
        );
      }

      // Use the recaptchaVerifier to send OTP
      const appVerifier = window.recaptchaVerifier;

      if (appVerifier.isExpired()) {
        appVerifier.reset(); // Reset if expired
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        appVerifier
      );
      setVerificationId(confirmationResult.verificationId);
      message.success("OTP has been sent successfully.");
    } catch (error) {
      console.error("Error sending OTP:", error);
      message.error("Failed to send OTP. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    if (!verificationId) {
      message.error("Verification ID not available. Please resend the OTP.");
      return;
    }

    try {
      setIsLoading(true);
      const credential = auth.PhoneAuthProvider.credential(verificationId, otp);
      await auth.signInWithCredential(credential);
      message.success("OTP Verified Successfully!");
      navigate("/u/profile");
    } catch (error) {
      console.error("Error verifying OTP: ", error);
      message.error("Invalid OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = () => {
    if (phoneNumber) {
      handleSendOtp(phoneNumber);
    } else {
      message.error("Phone number not available. Please try again.");
    }
  };

  return (
    <>
      <div
        style={{
          backgroundImage: `url(${loginbg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Card
          sx={{
            width: "90%",
            maxWidth: "400px",
            backgroundColor: "#51829B",
            borderRadius: 3,
            padding: "20px",
          }}
        >
          <CardContent
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "start",
            }}
          >
            <ArrowBackIcon
              sx={{
                alignSelf: "flex-start",
                color: "#FFFFFF",
                cursor: "pointer",
                mb: 3,
              }}
              onClick={() => navigate(-1)}
            />
            <Typography
              variant="h5"
              align="center"
              sx={{
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "2rem",
                mb: 2,
              }}
            >
              OTP Verification
            </Typography>
            {phoneNumber && (
              <Typography
                variant="h6"
                align="left"
                sx={{
                  color: "#FFFFFF",
                  fontSize: "0.875rem",
                  fontWeight: 400,
                  mb: 2,
                }}
              >
                OTP sent to your registered phone number {phoneNumber}.
              </Typography>
            )}
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
              sx={{ mb: 2 }}
            />
            <Button
              size="small"
              sx={{
                color: "#FFFFFF",
                border: "1px solid #FFFFFF",
                height: "30px",
                borderRadius: 2,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 500,
                fontSize: "12px",
                p: 2,
                mb: 2,
              }}
              onClick={handleResendOtp}
              disabled={isLoading}
            >
              Resend it
            </Button>
            <Button
              size="large"
              fullWidth
              sx={{
                color: "#FFFFFF",
                backgroundColor: "#F6995C",
                height: "50px",
                borderRadius: 2,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "1rem",
                mb: 3,
                "&:hover": { backgroundColor: "#F6995C" },
              }}
              onClick={handleVerifyOtp}
              disabled={isLoading}
            >
              Verify OTP
            </Button>
            <img
              className="image"
              src={image}
              alt="Description of image"
              style={{
                width: "250px",
                height: "auto",
                position: "relative",
                top: "40px",
                left: "40px",
              }}
            />
          </CardContent>
          {/* recaptcha container */}
          <div id="recaptcha-container"></div>
        </Card>
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
          <img src={loading2} alt="Loading..." />
        </div>
      )}
    </>
  );
};

export default OtpVerification;
