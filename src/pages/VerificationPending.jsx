import { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import useLogout from "../context/useLogout";
import { AuthContext } from "../context/AuthContext";

import { Button, Result } from "antd";

import ListItemIcon from "@mui/material/ListItemIcon";
import Logout from "@mui/icons-material/Logout";
import { Box } from "@mui/material";

const VerificationPending = () => {
  // Initialize verification from auth context
  const { verification } = useContext(AuthContext);
  // Initialize the useNavigate
  const navigate = useNavigate();

  // goToProfile Function
  const goToProfile = () => {
    navigate("/d/profile");
  };

  // Checks if user verification status
  useEffect(() => {
    if (verification === "verified") {
      // Redirect to the dermatologist profile
      navigate("/d/profile", { replace: true });
    }
  }, [verification, navigate]);

  return (
    <>
      <Result
        status="403"
        title="Your account is under verification."
        subTitle="Your documents have been submitted. Please allow 1 to 5 business days for processing."
        extra={
          <Button
            type="primary"
            size="large"
            style={{ width: "620px" }}
            onClick={goToProfile}
          >
            Yes, I understand.
          </Button>
        }
      />
    </>
  );
};

export default VerificationPending;
