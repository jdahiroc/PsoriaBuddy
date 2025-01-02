import React, { useState, useEffect } from "react";

// Styles
import "../../styles/adminaccountsverification.css";

import idCardFront from "../../assets/patient/avatar.png";

// Sidebar Component
import Sidebar from "../Sidebar/ASidebar";
// Ant Design Component
import { Table, message, Space, Button, Modal, Divider } from "antd";
// Material UI Icons
import FileOpenIcon from "@mui/icons-material/FileOpen";
// Firebase
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";

// Emailjs
import emailjs from "@emailjs/browser";

const AdminAccountsVerification = () => {
  const [tableData, setTableData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Initialize Firestore
  const db = getFirestore();

  // Message
  const showMessage = (type, content) => {
    message[type](content);
  };

  const handleOpenModal = (record) => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRecord(null);
  };

  // Handles Verify (Check Mark) Button
  const handleVerify = async (key) => {
    try {
      // Initialize the firebase collection "verification"
      const verificationRef = doc(db, "verification", key);
  
      // Get the verification data and check if the user exists
      const userSnapshot = await getDoc(verificationRef);
      if (!userSnapshot.exists()) {
        throw new Error("User does not exist in verification collection");
      }
  
      const userData = userSnapshot.data();
  
      // Assuming userData has a field `user_uid` that references the user document
      const userUid = userData.user_uid; // Ensure this is the correct field name in your `verification` collection
  
      // Check if the user UID is present
      if (!userUid) {
        throw new Error("User UID is missing in verification data");
      }
  
      // Retrieve user document from the "users" collection using the userUid
      const userRef = doc(db, "users", userUid);
      const userDoc = await getDoc(userRef);
  
      if (!userDoc.exists()) {
        throw new Error("User not found in users collection");
      }
  
      const user = userDoc.data();
  
      // Now update the user document with the verification status
      await updateDoc(userRef, { isVerified: true, verification: "verified" });
  
      // Update the table by filtering out the verified user
      setTableData((prev) => prev.filter((item) => item.key !== key));
  
      // Delete the user from the "verification" collection
      await deleteDoc(verificationRef);
  
      // Initialize Email.js
      const serviceID = import.meta.env.VITE_EMAILJS_SERVICE_ID2;
      const templateID = import.meta.env.VITE_EMAILJS_VERIFICATION_TEMPLATE_ID;
      const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY2;
  
      // Email Content
      const emailParams = {
        to_name: user.fullName || "User",
        to_email: user.email, 
      };
  
      // Check if email is empty or undefined
      if (!emailParams.to_email) {
        throw new Error("Email address is missing for the user");
      }
  
      // Execute the sending email to the user
      const response = await emailjs.send(
        serviceID,
        templateID,
        emailParams,
        publicKey
      );
  
      // Show the successful message
      showMessage(
        "success",
        "User verified successfully. Email notification sent."
      );
    } catch (error) {
      console.error("Error verifying user or sending email:", error);
      showMessage("error", "Failed to verify user or send email.");
    }
  };
  

  // Table columns
  const columns = [
    {
      title: "Application Date",
      dataIndex: "createdAt",
      key: "createdAt",
      className: "transparent-background",
      render: (createdAt) => {
        if (!createdAt) return "-";

        // A Firestore Timestamp, convert to date
        const date = createdAt.toDate
          ? createdAt.toDate()
          : new Date(createdAt);

        // Format date as desired
        return date.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });
      },
    },
    {
      title: "Status",
      dataIndex: "verification",
      key: "verification",
      className: "transparent-background",
      render: (verification) => {
        const colorMap = {
          pending: "#EE4E4E",
        };
        return (
          <span
            style={{
              color: colorMap[verification] || "black",
              fontWeight: 500,
            }}
          >
            {verification.toUpperCase()}
          </span>
        );
      },
    },
    {
      title: "Applicant Name",
      dataIndex: "fullName",
      key: "fullName",
      className: "transparent-background",
      render: (_, record) =>
        `${record.firstName || ""} ${record.middleName || ""} ${
          record.lastName || ""
        }`.trim(),
    },
    {
      title: "ID Type",
      dataIndex: "idType",
      key: "idType",
      className: "transparent-background",
      render: (idType) => {
        if (!idType) return "-";

        // Custom mapping for specific cases
        const idTypeMap = {
          board_certifications: "Board Certification",
          professional_regulation_commission_PRC:
            "Professional Regulation Commission (PRC)",
        };

        // If found in the map, return it directly
        if (idTypeMap[idType]) return idTypeMap[idType];

        // If not in the map, format snake_case to Title Case
        return idType
          .split("_")
          .map((word) => {
            if (word === "PRC") return "PRC"; // Handle PRC specifically
            return word.charAt(0).toUpperCase() + word.slice(1);
          })
          .join(" ");
      },
    },
    {
      title: "Expiration Date",
      dataIndex: "idExpirationDate",
      key: "idExpirationDate",
      className: "transparent-background",
    },
    {
      title: "Action",
      key: "action",
      render: (record) => (
        <Space size="middle">
          {record.verification === "pending" && (
            <Button
              type="primary"
              onClick={() => handleOpenModal(record)}
              style={{
                backgroundColor: "#1890ff",
                borderColor: "#1890ff",
                fontSize: "16px",
              }}
              icon={<FileOpenIcon style={{ fontSize: 21 }} />}
            >
              Review Application
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Fetch/Updates the verification data
  useEffect(() => {
    const usersRef = collection(db, "verification");

    // Set up real-time listener
    const unsubscribe = onSnapshot(usersRef, (querySnapshot) => {
      const users = querySnapshot.docs.map((doc) => ({
        key: doc.id,
        ...doc.data(),
      }));

      // Update the state with real-time data and sort them by date created
      setTableData(
        users.sort((a, b) => new Date(b.dateCreated) - new Date(a.dateCreated))
      );
    });

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, [db]);

  return (
    <>
      {/* Modal for Review Application */}
      <Modal
        title={
          <span
            style={{
              fontSize: 27,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
            }}
          >
            {(() => {
              const firstName = selectedRecord?.firstName;

              // Combine the names and trim any extra spaces
              const fullName = `${firstName || ""} `;

              return fullName;
            })()}
          </span>
        }
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={[
          <Button key="cancel" onClick={handleCloseModal}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => selectedRecord && handleVerify(selectedRecord.key)}
          >
            Verify user
          </Button>,
        ]}
      >
        {selectedRecord ? (
          <div>
            {/* -------------PERSONAL INFORMATION------------- */}
            <Divider orientation="left">Personal Information</Divider>
            <p>
              <strong>Applicant Name:</strong>{" "}
              {(() => {
                const { firstName, middleName, lastName } = selectedRecord;

                // Combine the names and trim any extra spaces
                const fullName = `${firstName || ""} ${middleName || ""} ${
                  lastName || ""
                }`.trim();

                return fullName;
              })()}
            </p>
            <p>
              <strong>Full Address:</strong> {selectedRecord.fullAddress}
            </p>
            <p>
              <strong>Nationality:</strong> {selectedRecord.nationality}
            </p>
            <p>
              <strong>Date of Birth:</strong> {selectedRecord.dateOfBirth}
            </p>
            <p>
              <strong>Place of Birth:</strong> {selectedRecord.placeOfBirth}
            </p>
            <p>
              <strong>Current Address:</strong>{" "}
              {(() => {
                const { fullAddress, zipCode } = selectedRecord;

                // Combine the names and trim any extra spaces
                const currentAddress = `${fullAddress || ""} ${
                  zipCode || ""
                }`.trim();

                return currentAddress;
              })()}
            </p>

            <p>
              <strong>Additional Address:</strong>{" "}
              {selectedRecord.additionalAddress}
            </p>

            {/* -------------IDENTIFICATION INFORMATION------------- */}
            <Divider orientation="left">Identification Information</Divider>
            <p>
              <strong>ID Type:</strong>{" "}
              {(() => {
                const idType = selectedRecord.idType;

                if (!idType) return "-";

                // Custom mapping for specific cases
                const idTypeMap = {
                  board_certifications: "Board Certification",
                  professional_regulation_commission_PRC:
                    "Professional Regulation Commission (PRC)",
                };

                // If found in the map, return it directly
                if (idTypeMap[idType]) return idTypeMap[idType];

                // If not in the map, format snake_case to Title Case
                return idType
                  .split("_")
                  .map((word) => {
                    if (word === "PRC") return "PRC"; // Handle PRC specifically
                    return word.charAt(0).toUpperCase() + word.slice(1);
                  })
                  .join(" ");
              })()}
            </p>

            <p>
              <strong>ID Number:</strong> {selectedRecord.idNumber}
            </p>

            <p>
              <strong>Expiration Date:</strong>{" "}
              {selectedRecord.idExpirationDate}
            </p>

            <p>
              <strong>Attachments:</strong>{" "}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  width: "30px",
                  height: "auto",
                }}
              >
                <img src={idCardFront} alt="Front ID" />
                <img src={idCardFront} alt="Front ID" />
                <img src={idCardFront} alt="Front ID" />
              </div>
            </p>

            {/* -------------STATUS------------- */}
            <Divider orientation="left">Verification Status</Divider>
            <p>
              <strong>Status:</strong>{" "}
              {(() => {
                const verification = selectedRecord.verification;

                if (!verification) return "-";

                const colorMap = {
                  pending: "#EE4E4E", // Specific color for "pending"
                };

                // Return the verification with the appropriate color and uppercase
                return (
                  <span
                    style={{
                      color: colorMap[verification] || "black", // Apply color if found in the map
                      fontWeight: 500,
                    }}
                  >
                    {verification.toUpperCase()}{" "}
                    {/* Convert the status to uppercase */}
                  </span>
                );
              })()}
            </p>
          </div>
        ) : (
          <p>Loading...</p>
        )}
      </Modal>

      <div className="admin-verification-container">
        <Sidebar />
        <div className="admin-verification-content">
          {/* Heading */}
          <div className="admin-verification-heading">
            <div className="admin-header">
              <h2>Account Verification</h2>
            </div>
          </div>

          <Table
            key={tableData.length}
            className="accountsdata-table"
            columns={columns}
            dataSource={tableData}
            rowKey="key"
            pagination={{
              pageSize: 7, // Display 7 records per page
              showSizeChanger: false, // Hide the page size changer
            }}
          />
        </div>
      </div>
    </>
  );
};

export default AdminAccountsVerification;
