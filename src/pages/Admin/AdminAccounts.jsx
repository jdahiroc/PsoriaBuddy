// Styles
import "../../styles/adminaccounts.css";
// Sidebar Component
import Sidebar from "../Sidebar/ASidebar";
// Assets
import plusicon from "../../assets/background/Plus.png";
// React Hooks
import { useState, useEffect } from "react";
import {
  Table,
  Modal,
  Input,
  Dropdown,
  Space,
  Typography,
  Button,
  Select,
  message,
} from "antd";
import {
  DeleteFilled,
  EyeInvisibleOutlined,
  EyeTwoTone,
  DownOutlined,
  CheckOutlined,
  EditOutlined,
} from "@ant-design/icons";

import {
  getFirestore,
  setDoc,
  doc,
  getDocs,
  getDoc,
  updateDoc,
  collection,
  deleteDoc,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth } from "../../../firebaseConfig";
// Emailjs
import emailjs from "@emailjs/browser";

const AdminAccounts = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [tableData, setTableData] = useState([]);
  const [editFormData, setEditFormData] = useState({});

  // Error state
  const [error, setError] = useState("");

  // Message
  const showMessage = (type, content) => {
    message[type](content);
  };

  // User input states
  const [newUserFullName, setNewUserFullName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserConfirmPassword, setNewUserConfirmPassword] = useState("");
  const [newUserUsername, setNewUserUsername] = useState("");
  const [selectedUserType, setSelectedUserType] = useState("User Type");

  // Initialize Firestore
  const db = getFirestore();

  const isPasswordValid = (password) => {
    const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{6,}$/;
    return passwordRegex.test(password);
  };

  // Open Edit Modal
  const handleEdit = (record) => {
    setEditFormData(record);
    setIsEditModalOpen(true);
  };

  // Close Edit Modal
  const handleEditCancel = () => {
    setIsEditModalOpen(false);
    setEditFormData({});
  };

  const handleOpenAddButton = () => {
    setIsModalOpen(true);
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newUserPassword !== newUserConfirmPassword) {
      setError("Passwords do not match");
      setNewUserPassword("");
      setNewUserConfirmPassword("");
      return;
    }

    if (!isPasswordValid(newUserPassword)) {
      setError(
        "Password must be at least 6 characters long, contain an uppercase letter, a lowercase letter, a number, and a special character"
      );
      setNewUserPassword("");
      setNewUserConfirmPassword("");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newUserEmail,
        newUserPassword
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      const userData = {
        fullName: newUserFullName,
        email: newUserEmail,
        username: newUserUsername,
        userType: selectedUserType,
        dateCreated: new Date().toLocaleDateString(),
        isVerified: selectedUserType === "Dermatologist" ? false : true,
      };

      await setDoc(doc(db, "users", user.uid), userData);

      setTableData((prevData) => [
        ...prevData.filter((item) => typeof item.key === "string"),
        {
          key: user.uid,
          ...userData,
        },
      ]);

      setIsModalOpen(false);
      showMessage("success", "Created New User");
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        showMessage(
          "error",
          "The email is already registered. Please contact support."
        );
      } else if (error.code === "auth/invalid-email") {
        showMessage(
          "error",
          "Invalid email address. Please provide a valid email."
        );
      } else if (error.code === "auth/weak-password") {
        showMessage("error", "Password must be at least 6 characters long.");
      } else {
        showMessage("error", "Failed to create account.");
      }
    }
  };

  // Handle dropdown menu click
  const handleMenuClick = (e) => {
    const selectedItem = items.find((item) => item.key === e.key);
    if (selectedItem) {
      setSelectedUserType(selectedItem.label.props.children);
    }
  };

  // Handle Delete
  const handleDelete = async (key) => {
    try {
      if (typeof key !== "string") {
        throw new Error(
          `Invalid key type detected: ${typeof key}, value: ${key}`
        );
      }

      await deleteDoc(doc(db, "users", key));
      setTableData((prev) => prev.filter((item) => item.key !== key));
      showMessage("success", "Successfully Deleted User");
    } catch (error) {
      console.error("Error deleting user:", error);
      showMessage("error", "Failed to delete user.");
    }
  };

  // Handles Verify (Check Mark) Button
  const handleVerify = async (key) => {
    try {
      const userRef = doc(db, "users", key);
      const userSnapshot = await getDoc(userRef);
      if (!userSnapshot.exists()) {
        throw new Error("User does not exist");
      }

      const userData = userSnapshot.data();

      await updateDoc(userRef, { isVerified: true });

      setTableData((prev) =>
        prev.map((item) =>
          item.key === key ? { ...item, isVerified: true } : item
        )
      );

      const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID2;
      const templateID = import.meta.env.VITE_EMAILJS_VERIFICATION_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY2;

      const emailParams = {
        to_name: userData.fullName || "User",
        to_email: userData.email,
      };

      await emailjs.send(serviceID, templateID, emailParams, publicKey);

      showMessage(
        "success",
        "User verified successfully! Email notification sent."
      );
    } catch (error) {
      console.error("Error verifying user or sending email:", error);
      showMessage("error", "Failed to verify user or send email.");
    }
  };

  // Submit Edited Data
  const handleEditSubmit = async () => {
    try {
      // Ensure fields are valid
      const updatedData = {
        fullName: editFormData.fullName || "",
        email: editFormData.email || "",
        username: editFormData.username || "",
        userType: editFormData.userType || "",
      };

      const userRef = doc(db, "users", editFormData.key);
      await updateDoc(userRef, updatedData);

      // Update table data
      setTableData((prevData) =>
        prevData.map((user) =>
          user.key === editFormData.key ? { ...user, ...updatedData } : user
        )
      );

      showMessage("success", "User account updated successfully!");
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Error updating user:", error);
      showMessage("error", "Failed to update user account.");
    }
  };

  // Table columns
  const columns = [
    {
      title: "Name",
      dataIndex: "fullName",
      key: "fullName",
      className: "transparent-background",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      className: "transparent-background",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      className: "transparent-background",
    },
    {
      title: "User Type",
      dataIndex: "userType",
      key: "userType",
      className: "transparent-background",
      render: (userType) => {
        const colorMap = {
          Admin: "#EE4E4E",
          Patient: "#F6995C",
          Dermatologist: "#51829B",
        };
        return (
          <span
            style={{
              color: colorMap[userType] || "black",
              fontWeight: 500,
            }}
          >
            {userType}
          </span>
        );
      },
    },
    {
      title: "Date Created",
      dataIndex: "dateCreated",
      key: "dateCreated",
      className: "transparent-background",
    },
    {
      title: "Verified",
      dataIndex: "isVerified",
      key: "isVerified",
      render: (isVerified, record) =>
        record.userType === "Dermatologist" ? (
          <span
            style={{
              color: isVerified ? "green" : "red",
              fontWeight: 500,
            }}
          >
            {isVerified ? "Yes" : "No"}
          </span>
        ) : (
          "N/A"
        ),
    },

    {
      title: "Action",
      key: "action",
      render: (record) => (
        <Space size="middle">
          {record.userType === "Dermatologist" && (
            <CheckOutlined
              onClick={() => {
                if (!record.isVerified) {
                  handleVerify(record.key);
                }
              }}
              style={{
                color: record.isVerified ? "gray" : "green",
                cursor: record.isVerified ? "not-allowed" : "pointer",
                pointerEvents: record.isVerified ? "none" : "auto",
              }}
            />
          )}
          <EditOutlined
            onClick={() => handleEdit(record)}
            style={{ color: "#1890ff", cursor: "pointer" }}
          />
          <DeleteFilled
            onClick={() => handleDelete(record.key)}
            style={{ color: "#ff4d4f", cursor: "pointer" }}
          />
        </Space>
      ),
    },
  ];

  // Dropdown menu items
  const items = [
    {
      key: "1",
      label: <span style={{ color: "#000000" }}>Patient</span>,
    },
    {
      key: "2",
      label: <span style={{ color: "#000000" }}>Dermatologist</span>,
    },
    {
      key: "3",
      label: <span style={{ color: "#000000" }}>Admin</span>,
    },
  ];

  const fetchUsers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      setTableData(
        querySnapshot.docs.map((doc) => ({
          key: doc.id,
          ...doc.data(),
        }))
      );
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  // Updates the users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Set filter to the deleted user data
  useEffect(() => {
    setTableData((data) => data.filter((item) => typeof item.key === "string"));
  }, []);

  return (
    <>
      <div className="admin-profile-container">
        <Sidebar />
        <div className="admin-profile-content">
          <div className="admin-profile-heading">
            {/* heading */}
            <div className="admin-header">
              <h2>Accounts</h2>
            </div>
          </div>

          <Table
            key={tableData.length}
            className="accountsdata-table"
            columns={columns}
            dataSource={tableData}
            rowKey="key"
          />
        </div>

        {/* Save Button */}
        <div className="derma-save" onClick={handleOpenAddButton}>
          <button style={{ backgroundColor: "#51829B", border: "none" }}>
            <img src={plusicon} alt="plus-icon" />
          </button>
        </div>
      </div>

      {/* Create New User Modal */}
      <Modal
        title="New User"
        open={isModalOpen}
        footer={null}
        onCancel={handleCancel}
      >
        <Input
          className="input-gap"
          placeholder="Full Name"
          name="name"
          value={newUserFullName}
          onChange={(e) => setNewUserFullName(e.target.value)}
        />
        <Input
          className="input-gap"
          placeholder="Email"
          name="email"
          value={newUserEmail}
          onChange={(e) => setNewUserEmail(e.target.value)}
        />
        <Input
          className="input-gap"
          placeholder="Username"
          name="username"
          value={newUserUsername}
          onChange={(e) => setNewUserUsername(e.target.value)}
        />
        <Input.Password
          className="input-gap"
          placeholder="Password"
          name="password"
          value={newUserPassword}
          onChange={(e) => setNewUserPassword(e.target.value)}
          iconRender={(visible) =>
            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
          }
        />
        <Input.Password
          className="input-gap"
          placeholder="Confirm Password"
          name="confirmPassword"
          value={newUserConfirmPassword}
          onChange={(e) => setNewUserConfirmPassword(e.target.value)}
          iconRender={(visible) =>
            visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
          }
        />
        <Dropdown
          overlayClassName="dropdown-menu"
          menu={{
            items,
            selectable: true,
            defaultSelectedKeys: ["2"],
            onClick: handleMenuClick,
          }}
        >
          <Typography.Link style={{ color: "#000000" }}>
            <Space>
              {selectedUserType}
              <DownOutlined />
            </Space>
          </Typography.Link>
        </Dropdown>
        <Button
          className="primary-button"
          type="primary"
          block
          style={{ backgroundColor: "#51829B" }}
          onClick={handleSubmit}
        >
          Create
        </Button>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title="Edit User"
        open={isEditModalOpen}
        footer={null}
        onCancel={handleEditCancel}
      >
        <Input
          className="input-gap"
          placeholder="Full Name"
          name="fullName"
          value={editFormData.fullName || ""}
          onChange={(e) =>
            setEditFormData({ ...editFormData, fullName: e.target.value })
          }
        />
        <Input
          className="input-gap"
          placeholder="Email"
          name="email"
          value={editFormData.email || ""}
          onChange={(e) =>
            setEditFormData({ ...editFormData, email: e.target.value })
          }
        />
        <Input
          className="input-gap"
          placeholder="Username"
          name="username"
          value={editFormData.username || ""}
          onChange={(e) =>
            setEditFormData({ ...editFormData, username: e.target.value })
          }
        />
        <Select
          className="input-gap"
          value={editFormData.userType || ""}
          onChange={(value) =>
            setEditFormData({ ...editFormData, userType: value })
          }
        >
          <Select.Option value="Admin">Admin</Select.Option>
          <Select.Option value="Patient">Patient</Select.Option>
          <Select.Option value="Dermatologist">Dermatologist</Select.Option>
        </Select>
        <Button
          className="primary-button"
          type="primary"
          block
          style={{ backgroundColor: "#51829B", marginTop: "20px" }}
          onClick={handleEditSubmit}
        >
          Save Changes
        </Button>
      </Modal>
    </>
  );
};

export default AdminAccounts;
