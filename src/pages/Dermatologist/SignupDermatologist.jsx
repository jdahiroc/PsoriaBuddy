// CSS
import "../../css/signupdermatologist.css";

// React and Hooks
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

// Firebase
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../../../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signOut,
  sendEmailVerification,
} from "firebase/auth";

// Assets
import appLogo from "../../assets/background/Psoriasis Logo.png";

// Ant Design
import { Spin, message, Checkbox, Modal } from "antd";
import { GoogleOutlined } from "@ant-design/icons";

// MUI Components
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";

// Reusable Notification Hook
const useNotification = () => {
  const [messageApi, contextHolder] = message.useMessage();

  const showNotification = (type, msg) => {
    messageApi[type](msg);
  };

  return { showNotification, contextHolder };
};

// Login Form Component
const SignUpForm = ({
  fullName,
  email,
  password,
  confirmPassword,
  showPassword,
  setFullName,
  setEmail,
  setPassword,
  setConfirmPassword,
  togglePasswordVisibility,
  showDisclaimerModal,
  isDisclaimerChecked,
  isAgreeChecked,
  handleDisclaimerChange,
  handleAgreeChange,
  onCreate,
  isLoading,
}) => {
  return (
    <>
      <TextField
        label="Full Name"
        variant="outlined"
        fullWidth
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        style={{ marginBottom: "0.3rem" }}
      />
      <TextField
        label="Email"
        variant="outlined"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ marginBottom: "0.3rem" }}
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
        style={{ marginBottom: "0.3rem" }}
      />
      <TextField
        label="Confirm Password"
        variant="outlined"
        fullWidth
        type={showPassword ? "text" : "password"}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={togglePasswordVisibility}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        style={{ marginBottom: "0.3rem" }}
      />
      {/* Disclaimer */}
      <div className="user-disclaimer-container">
        <div className="user-disclaimer-item1">
          <Checkbox
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              color: "#393939",
              textWrap: "wrap",
              marginTop: 2,
            }}
            checked={isDisclaimerChecked}
            onChange={handleDisclaimerChange}
          >
            I have read the{" "}
          </Checkbox>
          <span className="checkBox-span1" onClick={showDisclaimerModal}>
            disclaimer notice.
          </span>
        </div>
        <div className="user-disclaimer-item2">
          <Checkbox
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "12px",
              color: "#393939",
              textWrap: "wrap",
              marginTop: 2,
              marginBottom: 5,
            }}
            checked={isAgreeChecked}
            onChange={handleAgreeChange}
          >
            By clicking <span className="checkBox-span2">this</span>, you
            confirm that you have read, understood, and consent to the
            collection, processing, and storage of your personal and medical
            information as outlined above.
          </Checkbox>
        </div>
      </div>
      {/* Already Have an Account */}
      <div className="derma-signup-alreadyhaveaccount">
        <Link to="/d/login">
          <p>Already have an account?</p>
        </Link>
      </div>
      {/* Action Buttons */}
      <div className="derma-signup-buttons">
        <div className="derma-signup-button">
          <button
            onClick={onCreate}
            disabled={
              isLoading || !(isDisclaimerChecked && isAgreeChecked) // Disable if checkboxes are not checked
            }
          >
            Create Account
          </button>
        </div>
      </div>
    </>
  );
};

const SignupDermatologist = () => {
  // Input Forms States
  const [dermatologistFullName, setDermatologistFullName] = useState("");
  const [dermatologistEmail, setDermatologistEmail] = useState("");
  const [dermatologistPassword, setDermatologistPassword] = useState("");
  const [dermatologistConfirmPassword, setDermatologistConfirmPassword] =
    useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Error State
  const [error, setError] = useState("");

  // Disclaimer Modal states
  const [openDisclaimerNotice, setOpenDisclaimerNotice] = useState(false);
  const [isDisclaimerChecked, setIsDisclaimerChecked] = useState(false);
  const [isAgreeChecked, setIsAgreeChecked] = useState(false);

  // Message Notification
  const { contextHolder } = useNotification();

  // Navigations
  const navigate = useNavigate();

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

  // Function to validate password complexity
  const isPasswordValid = (password) => {
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{6,}$/;
    return passwordRegex.test(password);
  };

  // Handle Sign Up Button Processing
  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (dermatologistPassword !== dermatologistConfirmPassword) {
      setError("Passwords do not match!");
      setIsLoading(false);
      setDermatologistPassword("");
      setDermatologistConfirmPassword("");
      return;
    }

    if (!isPasswordValid(dermatologistPassword)) {
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
        dermatologistEmail,
        dermatologistPassword
      );
      const user = userCredential.user;

      // Send email verification to the user's email address
      await sendEmailVerification(user);

      // Save user credentials to Firestore Database
      await setDoc(doc(db, "users", user.uid), {
        fullName: dermatologistFullName,
        email: user.email,
        uid: user.uid,
        userType: "Dermatologist",
        isVerified: "false",
        createdAt: new Date(),
      });

      // Immediately log out the user after signup
      await signOut(auth);

      setIsLoading(false);
      //  After creation it will navigate to post creation
      navigate("/d/post");
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

      {/* Message Notification */}
      {contextHolder}
      <div className="derma-container">
        <div className="derma-signup-contents">
          <div className="derma-signup-left-section">
            <img src={appLogo} alt="logo" className="derma-signup-logo" />
          </div>
          <div className="derma-signup-right-header">
            <p>Create your account</p>
            {/* Sub-heading */}
            <div className="derma-signup-right-subheader">
              <p>Create your account as Dermatologist</p>
            </div>

            <SignUpForm
              fullName={dermatologistFullName}
              email={dermatologistEmail}
              password={dermatologistPassword}
              confirmPassword={dermatologistConfirmPassword}
              showPassword={showPassword}
              setFullName={setDermatologistFullName}
              setEmail={setDermatologistEmail}
              setPassword={setDermatologistPassword}
              setConfirmPassword={setDermatologistConfirmPassword}
              togglePasswordVisibility={() => setShowPassword(!showPassword)}
              isDisclaimerChecked={isDisclaimerChecked}
              isAgreeChecked={isAgreeChecked}
              showDisclaimerModal={showDisclaimerModal}
              handleDisclaimerChange={handleDisclaimerChange}
              handleAgreeChange={handleAgreeChange}
              onCreate={handleSignUp}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
      {isLoading && <Spin size="large" className="loading-spinner" />}
    </>
  );
};

export default SignupDermatologist;
