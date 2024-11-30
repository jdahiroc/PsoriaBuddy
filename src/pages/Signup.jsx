import { useState } from "react";
import { useNavigate } from "react-router-dom";
// MUI Components
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
// Ant Design Components
import { Spin, Alert, Checkbox, Modal } from "antd";
// CSS Styles
import "../css/signup.css";
// Firebase Configs
import {
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";

// Assets
import loginbg from "../assets/background/loginbg.png";
import logo from "../assets/background/PsoriaBuddy.png";

const SignUp = () => {
  // Patient Sign Up States
  const [patientFullName, setPatientFullName] = useState("");
  const [patientEmail, setPatientEmail] = useState("");
  const [patientPassword, setPatientPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [patientContactNumber, setContactNumber] = useState("");
  // Error State
  const [error, setError] = useState("");
  // Loading State
  const [isLoading, setIsLoading] = useState(false);
  // Show Password State
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // Disclaimer Modal states
  const [openDisclaimerNotice, setOpenDisclaimerNotice] = useState(false);
  const [isDisclaimerChecked, setIsDisclaimerChecked] = useState(false);
  const [isAgreeChecked, setIsAgreeChecked] = useState(false);
  // Navigation
  const navigate = useNavigate();
  // Show Password Handling
  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleClickShowConfirmPassword = () =>
    setShowConfirmPassword(!showConfirmPassword);
  const handleMouseDownPassword = (e) => e.preventDefault();

  // Disclaimer Modal
  const showDisclaimerModal = () => {
    setOpenDisclaimerNotice(true);
  };

  const handleDisclaimerChange = (e) => {
    setIsDisclaimerChecked(e.target.checked);
  };

  const handleAgreeChange = (e) => {
    setIsAgreeChecked(e.target.checked);
  };

  const handleOk = () => {
    setIsDisclaimerChecked(true);
    setOpenDisclaimerNotice(false);
  };
  const handleCancel = () => {
    setOpenDisclaimerNotice(false);
  };

  // onClose Handling for Alert
  const handleClose = () => {
    // Clear the error when the Alert is closed
    setError("");
  };
  // Function to validate password complexity
  const isPasswordValid = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/;
    return passwordRegex.test(password);
  };

  // Handle Sign Up Button Processing
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (patientPassword !== confirmPassword) {
      setError("Passwords do not match!");
      setIsLoading(false);
      setPatientPassword("");
      setConfirmPassword("");
      return;
    }

    if (!isPasswordValid(patientPassword)) {
      setError(
        "Password must be at least 6 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character."
      );
      setIsLoading(false);
      setPatientPassword("");
      setConfirmPassword("");
      return;
    }

    try {
      // Create user with Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        patientEmail,
        patientPassword
      );
      const user = userCredential.user;

      // Send email verification to the user's email address
      await sendEmailVerification(user);

      // Save user credentials to Firestore Database
      await setDoc(doc(db, "users", user.uid), {
        fullName: patientFullName,
        email: user.email,
        contactNumber: patientContactNumber,
        uid: user.uid,
        createdAt: new Date(),
      });

      // Immediately log out the user after signup
      await signOut(auth);

      setIsLoading(false);
      navigate("/post-creation"); // You might consider creating a different page notifying users to verify their email.
    } catch (error) {
      // Sets specific error messages based on Firebase response
      if (error.code === "auth/email-already-in-use") {
        setError("This email is already in use. Please use a different email.");
      } else if (error.code === "auth/invalid-email") {
        setError("Invalid email format. Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Failed to create account. Please try again.");
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Disclaimer Notice */}
      <Modal
        open={openDisclaimerNotice}
        onOk={handleOk}
        onCancel={handleCancel}
        width={850}
        footer={[
          <Button key="back" type="primary" onClick={handleCancel}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            I Agree
          </Button>,
        ]}
        style={{
          paddingTop: "10px",
        }}
      >
        <div className="disclaimer-notice-container">
          <div className="disclaimer-notice-contents">
            <div className="disclaimer-notice-header">
              <p>Disclaimer Notice</p>
            </div>
            <div className="disclaimer-notice-subheader">
              <p>Welcome to PsoriaBuddy!</p>
            </div>
            <div className="disclaimer-notice-text1">
              <p>
                Before you proceed, please carefully read and accept the
                following terms regarding the collection, processing, and
                storage of your personal and medical information:
              </p>
            </div>
            <div className="disclaimer-notice-lists">
              <div className="disclaimer-notice-text2">
                <ul>
                  <li>Data Collection an Purpose</li>
                  <span>
                    PsoriaBuddy collects your personal and medical data to
                    provide personalized symptom management, connect you with
                    dermatologists, and improve your overall healthcare
                    experience.
                  </span>
                </ul>
              </div>
              <div className="disclaimer-notice-text3">
                <ul>
                  <li>Data Usage</li>
                  <span>Your data will be used strictly for:</span>
                  <ul className="d-li">
                    <li>Tracking and managing your psoriasis symptoms.</li>
                    <li>
                      Scheduling and conducting consultations with licensed
                      dermatologists.
                    </li>
                    <li>
                      Providing educational resources tailored to your
                      condition.
                    </li>
                  </ul>
                </ul>
              </div>
              <div className="disclaimer-notice-text4">
                <ul>
                  <li>Data Storage and Security</li>
                  <span>
                    All information you provide is securely stored and
                    encrypted. We implement industry-standard security measures
                    to protect your data from unauthorized access.
                  </span>
                </ul>
              </div>
              <div className="disclaimer-notice-text5">
                <ul>
                  <li>Data Sharing</li>
                  <span>
                    Your personal and medical data will only be shared with your
                    chosen dermatologist and authorized personnel within the
                    PsoriaBuddy system. We will never sell or disclose your data
                    to third parties without your explicit consent, except as
                    required by law.
                  </span>
                </ul>
              </div>
              <div className="disclaimer-notice-text6">
                <ul>
                  <li>Your Rights and Access and Correction</li>
                  <span>
                    You may review and update your personal information at any
                    time.
                  </span>
                </ul>
              </div>
            </div>

            <div className="disclaimer-notice-text7">
              <p>
                By clicking <span>“I Agree”</span>, you confirm that you have
                read, understood, and consent to the collection, processing, and
                storage of your personal and medical information as outlined
                above.
              </p>
            </div>
          </div>
        </div>
      </Modal>

      <div className={`login-container ${isLoading ? "blur-background" : ""}`}>
        {/* Background */}
        <img className="loginbg" src={loginbg} alt="background" />
        <Card
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "780px",
            maxWidth: 400,
            backgroundColor: "#51829B",
            borderRadius: 3,
          }}
        >
          <CardContent
            style={{ width: "100%", marginTop: "10px", marginBottom: "10px" }}
          >
            <div className="signup-logo-container">
              <img
                className="logo"
                src={logo}
                alt="PsoriaBuddy Logo"
                style={{
                  width: "80%",
                  maxWidth: "300px",
                  height: "auto",
                  marginLeft: 0,
                }}
              />
            </div>
            <form onSubmit={handleSignUp}>
              <TextField
                label="Full Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={patientFullName}
                onChange={(e) => setPatientFullName(e.target.value)}
                InputLabelProps={{ style: { color: "#000000" } }}
                InputProps={{
                  style: {
                    color: "#000000",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 8,
                  },
                }}
                style={{ width: "300px", height: "45px", left: "33.5px" }}
                disabled={isLoading}
              />
              <TextField
                label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                value={patientEmail}
                onChange={(e) => setPatientEmail(e.target.value)}
                InputLabelProps={{ style: { color: "#000000" } }}
                InputProps={{
                  style: {
                    color: "#000000",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 8,
                  },
                }}
                style={{ width: "300px", height: "45px", left: "33.5px" }}
                disabled={isLoading}
              />
              <TextField
                label="Password"
                variant="outlined"
                type={showPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                value={patientPassword}
                onChange={(e) => setPatientPassword(e.target.value)}
                InputLabelProps={{ style: { color: "#000000" } }}
                InputProps={{
                  style: {
                    color: "#000000",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 8,
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{ color: "#393939" }}
                        disabled={isLoading}
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
                style={{ width: "300px", left: "33.5px" }}
                disabled={isLoading}
              />
              <TextField
                label="Confirm Password"
                variant="outlined"
                type={showConfirmPassword ? "text" : "password"}
                fullWidth
                margin="normal"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputLabelProps={{ style: { color: "#000000" } }}
                InputProps={{
                  style: {
                    color: "#000000",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 8,
                  },
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                        sx={{ color: "#393939" }}
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <VisibilityOff fontSize="small" />
                        ) : (
                          <Visibility fontSize="small" />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                style={{ width: "300px", left: "33.5px" }}
                disabled={isLoading}
              />
              <TextField
                label="Contact Number"
                variant="outlined"
                fullWidth
                margin="normal"
                value={patientContactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                InputLabelProps={{ style: { color: "#000000" } }}
                InputProps={{
                  style: {
                    color: "#000000",
                    backgroundColor: "#FFFFFF",
                    borderRadius: 8,
                  },
                }}
                style={{ width: "300px", left: "33.5px" }}
                disabled={isLoading}
              />
              {error && (
                <Alert
                  description={error}
                  type="error"
                  closable
                  onClose={handleClose}
                  style={{
                    marginBottom: "16px",
                    width: "300px",
                    left: "33.5px",
                  }}
                />
              )}
              <div className="user-disclaimer-container">
                <div className="user-disclaimer-item1">
                  <Checkbox
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      color: "#ffffff",
                      textWrap: "wrap",
                      marginTop: 2,
                    }}
                    checked={isDisclaimerChecked}
                    onChange={handleDisclaimerChange}
                  >
                    I have read the{" "}
                  </Checkbox>
                  <span
                    className="checkBox-span1"
                    onClick={showDisclaimerModal}
                  >
                    disclaimer notice.
                  </span>
                </div>
                <div className="user-disclaimer-item2">
                  <Checkbox
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "12px",
                      color: "#ffffff",
                      textWrap: "wrap",
                      marginTop: 2,
                      marginBottom: 5,
                    }}
                    checked={isAgreeChecked}
                    onChange={handleAgreeChange}
                  >
                    By clicking <span className="checkBox-span2">this</span>,
                    you confirm that you have read, understood, and consent to
                    the collection, processing, and storage of your personal and
                    medical information as outlined above.
                  </Checkbox>
                </div>
              </div>
              <Typography
                variant="body2"
                color="#FFFFFF"
                align="left"
                sx={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  ml: 5,
                  mt: 1,
                  mb: 1,
                }}
                onClick={() => navigate("/login")}
              >
                Already have an account?
              </Typography>

              <CardActions
                sx={{ flexDirection: "column", alignItems: "center" }}
              >
                <Button
                  type="submit"
                  sx={{
                    mb: 2,
                    color: "#FFFFFF",
                    backgroundColor: "#FEA66C",
                    height: "50px",
                    borderRadius: 2,
                    width: "300px",
                    "&:hover": { backgroundColor: "#F6995C" },
                  }}
                  disabled={
                    isLoading || !(isDisclaimerChecked && isAgreeChecked) // Disable if checkboxes are not checked
                  }
                >
                  Create Account
                </Button>
              </CardActions>
            </form>
          </CardContent>
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
            color: "#FFFFFF",
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <Spin size="large" tip="Creating Account..." />
        </div>
      )}
    </>
  );
};

export default SignUp;
