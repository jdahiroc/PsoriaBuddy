import { Button, Result } from "antd";
import useLogout from "../context/useLogout";

const VerificationPending = () => {
  // Initialize the custom logout hook
  const { logout } = useLogout();

  return (
    <Result
      title="Your account is under verification."
      subTitle="We will notify you once your account is verified. Please try again later."
      extra={
        <Button type="primary" onClick={logout}>
          Back to login
        </Button>
      }
    />
  );
};

export default VerificationPending;
