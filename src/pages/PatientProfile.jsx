// css file
import "../styles/patientprofile.css";
// Patient Side Bar
import Sidebar from "./Sidebar/Sidebar";
// Assets
import avatar from "../../src/assets/patient/patient-avatar.png";
import checkicon from "../../src/assets/patient/Save.png";
import passwordIcon from "../../src/assets/background/Password-icon.png";
// React Hooks
import { useState, useEffect, useContext } from "react";
// Ant Design Components
import { PlusOutlined } from "@ant-design/icons";
import {
  Image,
  Upload,
  DatePicker,
  Select,
  Space,
  Alert,
  Skeleton,
  Modal,
  Button,
  message,
} from "antd";
// Firebase Hooks
import { AuthContext } from "../context/AuthContext";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";

import moment from "moment";
import dayjs from "dayjs";

const db = getFirestore();

// Function to convert file to base64
const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

// Main Function
const PatientProfile = () => {
  // CurrentUser from AuthContext
  const { currentUser } = useContext(AuthContext);
  // Loading state
  const [loading, setLoading] = useState(true);
  // Preview Open Function State
  const [previewOpen, setPreviewOpen] = useState(false);
  // Preview Image State
  const [previewImage, setPreviewImage] = useState("");
  // File List State
  const [fileList, setFileList] = useState([]);
  // Success Alert State
  const [successAlert, setSuccessAlert] = useState(false);

  // Change Password Modal States
  const [openChangePassword, setOpenChangePassword] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [email, setEmail] = useState("");

  // Change Password Modal
  const showChangePassword = () => {
    setOpenChangePassword(true);
  };

  const handleSendPasswordLink = async () => {
    const auth = getAuth();
    setLoading(true);
    setConfirmLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      message.success("Change Password link has been sent to your email!");

      setEmail("");
      setOpenChangePassword(false);
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
      setConfirmLoading(false);
      setTimeout(() => setOpenChangePassword(false), 500);
    }
  };

  const handleCancelSendPasswordLink = () => {
    setOpenChangePassword(false);
  };

  // Structured Profile Data
  const [profileData, setProfileData] = useState({
    fullName: "",
    username: "",
    email: "",
    gender: "",
    birthday: null,
    yearsOfPsoriasis: "",
    occupation: "",
    lifestyleHabits: "",
  });

  // Fetch user profile data when the component mounts
  useEffect(() => {
    const fetchProfileData = async () => {
      if (currentUser) {
        try {
          // Initialize the reference to the user's document
          const userRef = doc(db, "users", currentUser.uid);
          // Get the user's document
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setProfileData(userSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfileData();
  }, [currentUser]);

  // Handles Preview of the image
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  // Handles the change of the file list or accepted files
  const handleChange = ({ fileList: newFileList }) => {
    const validFiles = newFileList.filter(
      (file) => file.type === "image/jpeg" || file.type === "image/png"
    );
    setFileList(validFiles); // Only set valid files to the fileList state
  };

  // Restrict user from uploading files other than .jpg or .png
  const handleBeforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      alert(
        "Only image files in .jpg or .png formats are supported. Please try again."
      );
    }
    return isJpgOrPng || Upload.LIST_IGNORE; // Prevent file from being added to fileList if invalid
  };

  // Handle Save Function
  const handleSave = async () => {
    try {
      if (currentUser) {
        // Initialize the reference to the user's document
        const userRef = doc(db, "users", currentUser.uid);
        // Save the user's profile data
        await setDoc(userRef, profileData, { merge: true });
        // Show the alert when the save button is clicked
        setSuccessAlert(true);

        // Hide the alert after a few seconds
        setTimeout(() => {
          setSuccessAlert(false);
        }, 3000);
      }
    } catch (error) {
      console.error("Error saving user profile:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleGenderChange = (value) => {
    setProfileData((prevData) => ({
      ...prevData,
      gender: value,
    }));
  };

  const handleDateChange = (date, dateString) => {
    setProfileData((prevData) => ({
      ...prevData,
      birthday: dateString,
    }));
  };

  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );

  return (
    <>
      {/* -----------------------
     Show Change Password Modal 
     -------------------------- */}
      <Modal
        open={openChangePassword}
        onOk={handleSendPasswordLink}
        confirmLoading={confirmLoading}
        onCancel={handleCancelSendPasswordLink}
        footer={[
          <Button
            key="submit"
            type="primary"
            loading={loading}
            onClick={handleSendPasswordLink}
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              backgroundColor: "#F6995C",
              padding: "20px 25px",
            }}
          >
            Send Password Link
          </Button>,
        ]}
      >
        <div className="patient-changePassword-container">
          <div className="patient-changePassword-contents">
            <div className="patient-changePassword-header">
              <p>Change Password</p>
            </div>
            <div className="patient-changePassword-subheader">
              <p>Kindly provide your email to receive a password link.</p>
            </div>
            <div className="patient-changePassword-input">
              <input
                type="text"
                placeholder="Enter your email "
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>
        </div>
      </Modal>

      <div className="patient-profile-container">
        {/* SideBar */}
        <Sidebar />
        {/* Alert Message */}
        <div className="patient-profile-content">
          {successAlert && (
            <div className="patient-alert">
              <Alert message="Profile Saved" type="success" showIcon />
            </div>
          )}
          <div className="patient-profile-heading">
            <div className="patient-header">
              <h2>My Profile</h2>
            </div>
          </div>

          <div className="patient-profile-avatar">
            <div className="patient-avatar">
              <img src={avatar} alt="patient-img" />
              <Upload
                action="https://660d2bd96ddfa2943b33731c.mockapi.io/api/upload"
                listType="picture-circle"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                beforeUpload={handleBeforeUpload} // Restrict file types
              >
                {fileList.length >= 8 ? null : uploadButton}
              </Upload>
              {previewImage && (
                <Image
                  wrapperStyle={{
                    display: "none",
                  }}
                  preview={{
                    visible: previewOpen,
                    onVisibleChange: (visible) => setPreviewOpen(visible),
                    afterOpenChange: (visible) =>
                      !visible && setPreviewImage(""),
                  }}
                  src={previewImage}
                />
              )}
            </div>
          </div>

          {loading ? (
            // Render Skeleton when loading
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                marginLeft: "300px",
                width: "1150px",
              }}
            >
              <Skeleton active paragraph={{ rows: 4 }} />
            </div>
          ) : (
            <>
              {/* ------------------------------------------
                    Personal Information Header 
                  ------------------------------------------ */}
              <div className="patient-personalInfo-container">
                <div className="patient-personalInfo-header">
                  <p>Personal Information</p>
                </div>
              </div>
              {/* Patient Profile Contents */}
              <div className="patient-profile-forms">
                <div className="patient-profile-column">
                  <div className="patient-content">
                    {/* FullName */}
                    <div className="patient-fullname">
                      <div className="patient-fullname-label">
                        <label>Name</label>
                      </div>
                      <div className="patient-fullname-input">
                        <input
                          type="text"
                          name="fullName"
                          value={profileData.fullName || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    {/* Username */}
                    <div className="patient-username">
                      <div className="patient-username-label">
                        <label>Username</label>
                      </div>
                      <div className="patient-username-input">
                        <input
                          type="text"
                          name="username"
                          value={profileData.username || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    {/* Email */}
                    <div className="patient-email">
                      <div className="patient-email-label">
                        <label>Email</label>
                      </div>
                      <div className="patient-email-input">
                        <input
                          type="text"
                          name="email"
                          value={profileData.email || ""}
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="patient-gender-birth-container">
                      {/* Gender */}
                      <div className="patient-gender">
                        <div className="patient-gender-label">
                          <label>Gender</label>
                        </div>
                        <div className="patient-gender-input">
                          <Space>
                            <Select
                              value={profileData.gender || ""}
                              style={{
                                width: 200,
                                height: 37,
                                marginTop: 7,
                              }}
                              allowClear
                              onChange={handleGenderChange}
                              options={[
                                { value: "Male", label: "Male" },
                                { value: "Female", label: "Female" },
                                {
                                  value: "Prefer not to say",
                                  label: "Prefer not to say",
                                },
                                { value: "Other", label: "Other" },
                              ]}
                            />
                          </Space>
                        </div>
                      </div>
                      {/* Birthday */}
                      <div className="patient-birthday">
                        <div className="patient birthday-label">
                          <label>Birthday</label>
                        </div>
                        <div className="patient-birthday-input">
                          <Space>
                            <DatePicker
                              value={
                                profileData.birthday
                                  ? moment(profileData.birthday).isValid()
                                    ? moment(profileData.birthday)
                                    : dayjs(profileData.birthday)
                                  : null
                              }
                              onChange={handleDateChange}
                              placeholder="Select date"
                              style={{
                                width: 200,
                                height: 37,
                                marginTop: 7,
                                paddingTop: 16,
                              }}
                            />
                          </Space>
                        </div>
                      </div>
                    </div>
                    {/* Accounts Section */}
                    <div className="patient-accounts-container">
                      <div className="patient-accounts-row">
                        <div className="patient-accounts-header">
                          <p>Accounts</p>
                        </div>
                        <div className="patient-accounts-contents">
                          <div className="patient-accounts-password-container">
                            <div className="patient-accounts-password-row">
                              <div className="patient-accounts-password-icon">
                                <img src={passwordIcon} alt="" />
                              </div>
                              <div className="patient-account-password-label">
                                <p>Password:</p>
                              </div>
                              <div className="patient-account-password-button">
                                <button onClick={showChangePassword}>
                                  Reset my password
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="patient-content-right">
                    {/* Years of psoriasis */}
                    <div className="patient-years-of-psoriasis">
                      <div className="patient-years-of-psoriasis-label">
                        <label>How many years have you had psoriasis?</label>
                      </div>
                      <div className="patient-years-of-psoriasis-input">
                        <input
                          type="text"
                          name="yearsOfPsoriasis"
                          value={profileData.yearsOfPsoriasis || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    {/* Occupation */}
                    <div className="patient-occupation">
                      <div className="patient-occupation-label">
                        <label>
                          Occupation (e.g. student, teacher, engineer, etc.)
                        </label>
                      </div>
                      <div className="patient-occupation-input">
                        <input
                          type="text"
                          name="occupation"
                          value={profileData.occupation || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    {/* Lifestyle habits */}
                    <div className="patient-lifestylehabits">
                      <div className="patient-lifestylehabits-label">
                        <label>
                          What are your lifestyle habits? (e.g. Smoker, for 2
                          years?)
                        </label>
                      </div>
                      <div className="patient-lifestylehabits-input">
                        <input
                          type="text"
                          name="lifestyleHabits"
                          value={profileData.lifestyleHabits || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    {/* Patient Save Button */}
                    <div className="patient-save">
                      <button onClick={handleSave}>
                        <img src={checkicon} alt="check-icon" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default PatientProfile;
