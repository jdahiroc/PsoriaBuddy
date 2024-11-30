// MUI Components
import loginbg from "../assets/background/loginbg.png";
import imagetwo from "../assets/background/WomenPowerMeditating.png";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Button from "@mui/material/Button";
// CSS Styles
import "../css/login.css";

// React Hooks
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate("/login");
  };
  return (
    <>
      <img className="loginbg" src={loginbg} alt="background" />
      <div
        className="login-container"
        style={{
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <img
          className="imagetwo"
          src={imagetwo}
          alt="background"
          style={{
            width: "500px",
            height: "250px",
            margin: "20px 0",
            marginBottom: "30px",
          }}
        />
        <div className="notice-description" style={{ width: 800 }}>
          <p
            style={{
              fontSize: "20px",
              fontFamily: "'Inter', sans-serif",
              fontWeight: 400,
              marginBottom: "50px",
              color: "#010101",
              opacity: 0.9,
              display: "flex",
              flexwrap: "wrap",
              textAlign: "start",
            }}
          >
            Thank you for signing up! A verification email has been sent to your
            email address. Please verify your email to complete your
            registration. After verifying, you can log in.
          </p>
        </div>
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <Button
            onClick={handleButtonClick}
            size="small"
            sx={{
              mb: 2,
              color: "#FFFFFF",
              backgroundColor: "#51829B",
              marginLeft: "10px",
              marginRight: "10px",
              height: "55px",
              borderRadius: 2,
              fontFamily: "'Inter', sans-serif",
              fontWeight: 600,
              fontSize: "17px",
              width: "300px",
              left: "0.5px",
              position: "relative",
              "&:hover": {
                backgroundColor: "#51829B",
              },
            }}
          >
            <span
              style={{
                position: "relative",
                top: "1px",
                left: "17px",
                fontSize: "22px",
              }}
            >
              Back to login
            </span>
            <ArrowForwardIcon
              sx={{ fontSize: "30px", fontWeight: "bold", marginLeft: "50px" }}
            />
          </Button>
        </div>
      </div>
    </>
  );
};

export default Login;
