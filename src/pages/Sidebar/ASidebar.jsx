import "../../styles/Sidebar/asidebar.css";

import { Link } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

import useLogout from "../../context/useLogout";
import { useEffect, useState, useContext } from "react";

// Assets
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";

import avatar from "../../assets/patient/avatar.png";

import { Menu, Layout, Divider } from "antd";
import { UserOutlined, CalendarOutlined } from "@ant-design/icons";

const { Sider } = Layout;

const ASidebar = () => {
  // Initialize the custom logout hook
  const { logout } = useLogout();
  // Initialize the AuthContext to get the current user
  const { currentUser } = useContext(AuthContext);

  // Initialize the user
  const [user, setUser] = useState([]);

  // Fetch the current user data
  useEffect(() => {
    setUser(currentUser);
  }, [currentUser]);

  // State to manage sidebar collapse
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={(value) => setCollapsed(value)}
        className="asidebar-container"
        trigger={
          <div
            style={{
              backgroundColor: "#F5FAFF",
              color: "#393939",
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              padding: "10px",
              textAlign: "center",
              outline: "none",
              cursor: "pointer",
            }}
            tabIndex={-1}
          >
            {collapsed ? <MenuRoundedIcon /> : <MenuOpenRoundedIcon />}
          </div>
        }
      >
        {/* Profile Section */}
        <div className="asidebar-profile">
          <div className="asidebar-avatar">
            <img
              src={user?.photoURL || avatar}
              alt="avatar"
              style={{
                width: collapsed ? "40px" : "55px",
                height: collapsed ? "40px" : "55px",
                borderRadius: "50%",
                objectFit: "cover",
                margin: "10px auto",
              }}
            />
          </div>
          {!collapsed && (
            <div className="asidebar-username">
              <h3>
                {user.fullName}
                <br />
                <sub
                  style={{
                    fontSize: "12px",
                    fontFamily: "Inter, sans-serif",
                    fontWeight: "400",
                    paddingTop: "5px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  {user.userType || "Loading..."}
                </sub>
              </h3>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <Menu
          theme="light"
          style={{
            backgroundColor: "#F5FAFF",
            fontFamily: "Inter, sans-serif",
            fontWeight: 500,
          }}
          mode="inline"
          defaultSelectedKeys={["1"]}
          className="asidebar-nav-naviations"
        >
          <Menu.SubMenu key="1" icon={<UserOutlined />} title="Accounts">
            <Menu.Item key="1-1">
              <Link to="/a/accounts">Accounts</Link>
            </Menu.Item>
            <Menu.Item key="1-2">
              <Link to="/a/accounts/verification">Verifications</Link>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="2" icon={<CalendarOutlined />}>
            <Link to="/a/events">Events</Link>
          </Menu.Item>

          {/* Divider */}
          <Divider />

          <Menu.Item key="3" icon={<ArrowBackIcon />}>
            <Link to="/">Go to Home</Link>
          </Menu.Item>

          <Menu.Item
            key="4"
            icon={<LogoutIcon />}
            onClick={logout}
            className="asidebar-nav-logout"
            style={{ color: "#EE4E4E" }}
          >
            Logout
          </Menu.Item>
        </Menu>
      </Sider>
    </>
  );
};

export default ASidebar;
