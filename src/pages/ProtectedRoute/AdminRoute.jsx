// React Hooks
import { useEffect, useState, useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
// Firebase Configs
import { AuthContext } from "../../context/AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";
// Ant Design Components
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const AdminRoute = () => {
  const { currentUser } = useContext(AuthContext);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      if (currentUser) {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists() && userDoc.data().userType === "Admin") {
          setIsAdmin(true);
        }
      }
      setLoading(false);
    };

    checkAdmin();
  }, [currentUser]);

  if (loading) {
    return (
      <>
        <div
          className="adminloading-container"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            height: "100vh",
          }}
        >
          <Spin indicator={<LoadingOutlined spin />} size="large" /> <br />
          <p style={{ paddingLeft: "0.5em" }}>Loading</p>
        </div>
      </>
    );
  }

  return isAdmin ? <Outlet /> : <Navigate to="/status/403" replace />;
};

export default AdminRoute;
