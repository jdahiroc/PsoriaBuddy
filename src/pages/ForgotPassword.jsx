// React Hooks
import { useState } from "react";
import { Link } from "react-router-dom";
// Material-UI Components
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
// Assets
import loginbg from "../assets/background/loginbg.png";
import logo from "../assets/background/PsoriaBuddy.png";
// Firebase Auth
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { message, Spin } from "antd";

const ForgotPassword = () => {
  // State to store the email input value
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Get the email input value
  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  // Password Reset Function
  const handlePasswordReset = async () => {
    const auth = getAuth();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      message.success("Password reset link has been sent to your email!");
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <img className="loginbg" src={loginbg} alt="background" />
      <div className="login-container">
        <Card
          sx={{
            height: 530,
            maxWidth: 400,
            backgroundColor: "#51829B",
            borderRadius: 3,
          }}
        >
          <CardContent>
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
            <TextField
              label="Email"
              variant="outlined"
              fullWidth
              margin="normal"
              InputLabelProps={{ style: { color: "#000000" } }}
              InputProps={{
                style: {
                  color: "#000000",
                  backgroundColor: "#FFFFFF",
                  borderRadius: 8,
                  fontFamily: "'Inter', sans-serif",
                },
              }}
              style={{ width: "300px", left: "33.5px", fontWeight: 500 }}
              value={email}
              onChange={handleEmailChange}
            />
            <Link to="/login">
              <Typography
                variant="body2"
                color="#FFFFFF"
                align="right"
                sx={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontFamily: "'Inter', sans-serif",
                  fontWeight: 400,
                  position: "relative",
                  right: "160px",
                  marginTop: "10px",
                }}
              >
                Already have an account?
              </Typography>
            </Link>
          </CardContent>
          <CardActions sx={{ flexDirection: "column", alignItems: "center" }}>
            <Button
              size="small"
              onClick={handlePasswordReset}
              disabled={loading}
              sx={{
                mb: 2,
                color: "#FFFFFF",
                backgroundColor: "#F6995C",
                marginLeft: "10px",
                marginRight: "10px",
                height: "50px",
                borderRadius: 2,
                fontFamily: "'Inter', sans-serif",
                fontWeight: 600,
                fontSize: "17px",
                width: "300px",
                left: "0.5px",
                position: "relative",
                "&:hover": {
                  backgroundColor: "#F6995C",
                },
              }}
            >
              {loading ? <Spin /> : "Continue"}
            </Button>
          </CardActions>
        </Card>
      </div>
    </>
  );
};

export default ForgotPassword;
