// React Hooks
import { useState, useContext, useRef, useEffect } from "react";
// Styles
import "../../css/dermatologistprofile.css";
// Firebase Configs
import { db } from "../../../firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { AuthContext } from "../../context/AuthContext";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
// Assets
import Ellipse5 from "../../assets/background/Ellipse5.png";
import passwordIcon from "../../assets/background/Password-icon.png";
// MUI Components
import SaveIcon from "@mui/icons-material/Save";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
// Ant Design Components
import { Input, Alert, Skeleton, Modal, Button, message} from "antd";
// Sidebar Component
import Sidebar from "../Sidebar/DSidebar";

const Dermatologistprofile = () => {
  // Loading state
  const [loading, setLoading] = useState(true);
  // Get the current logged in user
  const { currentUser } = useContext(AuthContext);
  // Text Area from Ant Design
  const { TextArea } = Input;
  // State variables
  const [showMessage, setShowMessage] = useState(false);

  // Change Password  States
  const [openDermaChangePassword, setOpenDermaChangePassword] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [email, setEmail] = useState("");

  // Change Password Modal
  const showChangePassword = () => {
    setOpenDermaChangePassword(true);
  };

  const handleSendPasswordLink = async () => {
    const auth = getAuth();
    setLoading(true);
    setConfirmLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      message.success("Change Password link has been sent to your email!");

      setEmail("");
      setOpenDermaChangePassword(false);
    } catch (e) {
      message.error(e.message);
    } finally {
      setLoading(false);
      setConfirmLoading(false);
      setTimeout(() => setOpenDermaChangePassword(false), 500);
    }
  };

  const handleCancelSendPasswordLink = () => {
    setOpenDermaChangePassword(false);
  };

  // Fetch the user profile data from Firestore
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Initialize the path of the collection
        const userRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userRef);

        // Checks for the user document
        // if it exits
        if (userDoc.exists()) {
          setFormData((prevData) => ({
            ...prevData,
            ...userDoc.data(),
          }));
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        // Stop loading once data is fetched
        setLoading(false);
      }
    };
    fetchData();
  }, [currentUser.uid]);

  // Form Data State
  const [formData, setFormData] = useState({
    fullName: "",
    services: "",
    rate: "",
    years: "",
    username: "",
    consulationSchedules: "",
    email: "",
    aboutMe: "",
    collegeSchoolName: "",
    graduateAt: "",
  });

  // Fetch the current user data
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }));
  };

  const handleSaveClick = async () => {
    try {
      // Initialize the path Firestore database
      const userRef = doc(db, "users", currentUser.uid);
      // Save the form data to the Firestore database
      await setDoc(userRef, formData, { merge: true });
      // Show the success message
      setShowMessage(true);
      // Hide the message after 2 seconds
      setTimeout(() => setShowMessage(false), 5000);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <>
      {/* -----------------------
     Show Change Password Modal 
     -------------------------- */}
      <Modal
        open={openDermaChangePassword}
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
        <div className="dermatologist-changePassword-container">
          <div className="dermatologist-changePassword-contents">
            <div className="dermatologist-changePassword-header">
              <p>Change Password</p>
            </div>
            <div className="dermatologist-changePassword-subheader">
              <p>Kindly provide your email to receive a password link.</p>
            </div>
            <div className="dermatologist-changePassword-input">
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

      {/* Dermatologist Personal Information */}
      <div className="dermatologistprofile-container">
        <Sidebar />
        <div className="dermatologistprofile-rightSection">
          {showMessage && (
            <div className="save-message">
              <Alert message="Profile Saved" type="success" showIcon />
            </div>
          )}
          <div className="dermatologist-profile-heading">
            <div className="dermatologist-profile-h2">
              <div className="page-profile-text">Profile</div>
            </div>
          </div>
          <div className="dermatologist-profile-avatar">
            <div className="dermatologist-profile-image">
              <img src={Ellipse5} alt="Ellipse" className="ellipse-image" />
            </div>
            <div className="dermatologist-profile-savebutton">
              <button className="save-button" onClick={handleSaveClick}>
                <SaveIcon style={{ color: "#FFFFFF" }} />
              </button>
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
              <div className="text-field-container1">
                <div className="derma-personalInfo-container">
                  {/* Personal Information Header */}
                  <div className="derma-personalInfo-header">
                    <div className="derma-personalinfo-text">
                      <p>Personal Information</p>
                    </div>
                  </div>
                  <div className="text-field-row1">
                    {/* Full Name */}
                    <div className="derma-fullName">
                      <div className="derma-fullName-label">
                        <label
                          htmlFor="name-basic"
                          className="name-text-field-label"
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#393939",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          Name
                        </label>
                      </div>
                      <div className="derma-fullName-textField">
                        <TextField
                          id="fullName"
                          value={formData.fullName}
                          onChange={handleInputChange}
                          label=""
                          variant="outlined"
                          className="name-text-field"
                        />
                      </div>
                    </div>
                    {/* Service */}
                    <div className="derma-service">
                      <div className="derma-service-label">
                        <label
                          htmlFor="services-basic"
                          className="services-text-field-label"
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#393939",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          Services Offers
                        </label>
                      </div>
                      <div className="derma-service-textField">
                        <TextField
                          id="services"
                          value={formData.services}
                          onChange={handleInputChange}
                          label=""
                          variant="outlined"
                          className="services-text-field"
                        />
                      </div>
                    </div>
                    {/* Rate */}
                    <div className="derma-rate">
                      <div className="derma-rate-label">
                        <label
                          htmlFor="rate-basic"
                          className="rate-text-field-label"
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#393939",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          Rate
                        </label>
                      </div>
                      <div className="dermar-rate-textField">
                        <FormControl className="rate-text-field">
                          <OutlinedInput
                            id="rate"
                            value={formData.rate}
                            onChange={handleInputChange}
                            startAdornment={
                              <InputAdornment position="start">
                                ₱
                              </InputAdornment>
                            }
                            label=""
                          />
                        </FormControl>
                      </div>
                    </div>
                    {/* Years */}
                    <div className="derma-years">
                      <div className="derma-years-label">
                        <label
                          htmlFor="years-basic"
                          className="years-text-field-label"
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#393939",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          Years Of Experience
                        </label>
                      </div>
                      <div className="derma-years-textField">
                        <TextField
                          id="years"
                          value={formData.years}
                          onChange={handleInputChange}
                          label=""
                          variant="outlined"
                          className="years-text-field"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-field-row2">
                  <div className="derma-username-email-left">
                    <div className="derma-username">
                      <div className="derma-username-label">
                        <label
                          htmlFor="username-basic"
                          className="username-text-field-label"
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#393939",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          Username
                        </label>
                      </div>
                      <div className="derma-username-textField">
                        <TextField
                          id="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          label=""
                          variant="outlined"
                          className="username-text-field"
                        />
                      </div>
                    </div>

                    <div className="derma-email">
                      <div className="derma-email-label">
                        <label
                          htmlFor="email-basic"
                          className="email-text-field-label"
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#393939",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          Email
                        </label>
                      </div>
                      <div className="derma-email-textField">
                        <TextField
                          id="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          label=""
                          variant="outlined"
                          className="email-text-field"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="derma-online-consulation-schedule">
                    <div className="derma-online-consultation-label">
                      <label
                        htmlFor="online-basic"
                        className="online-text-field-label"
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#393939",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        Online Consultation Schedules
                      </label>
                    </div>
                    <div className="derma-online-consultation-textField">
                      <TextArea
                        id="consulationSchedules"
                        rows={3}
                        value={formData.consulationSchedules}
                        onChange={(e) =>
                          handleInputChange({
                            target: {
                              id: "consulationSchedules",
                              value: e.target.value,
                            },
                          })
                        }
                        placeholder="Tell us about yourself"
                        maxLength={400}
                        style={{
                          width: "100%",
                          minWidth: "710px",
                          height: "100%",
                          minHeight: "135px",
                          fontFamily: "Inter, sans-serif",
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-field-row3">
                  <div className="derma-aboutme">
                    <div className="derma-aboutme-label">
                      <label
                        htmlFor="email-basic"
                        className="email-text-field-label"
                        style={{
                          fontSize: "16px",
                          fontWeight: "600",
                          color: "#393939",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        About me
                      </label>
                    </div>
                    <div className="derma-aboutme-textField">
                      <TextArea
                        id="aboutMe"
                        rows={4}
                        value={formData.aboutMe}
                        onChange={(e) =>
                          handleInputChange({
                            target: { id: "aboutMe", value: e.target.value },
                          })
                        }
                        placeholder="Tell us about yourself"
                        maxLength={400}
                        style={{
                          width: "100%",
                          minWidth: "423px",
                          height: "100%",
                          minHeight: "135px",
                        }}
                      />
                    </div>
                  </div>

                  <div className="derma-educational-attain">
                    <div className="derma-educational-attainment">
                      <div className="derma-educational-attainment-label">
                        <label
                          htmlFor="education-basic"
                          className="email-text-field-label"
                          style={{
                            fontSize: "16px",
                            fontWeight: "600",
                            color: "#393939",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          Education Attainment
                        </label>
                      </div>
                      <div className="derma-educational-attainment-textField">
                        <TextField
                          id="collegeSchoolName"
                          value={formData.collegeSchoolName}
                          onChange={(e) =>
                            handleInputChange({
                              target: {
                                id: "collegeSchoolName",
                                value: e.target.value,
                              },
                            })
                          }
                          placeholder="University or College Name"
                          className="collegeName-field"
                        />
                      </div>
                    </div>
                    <div className="derma-educational-attainment-years">
                      <div className="derma-educational-attain-years">
                        <div className="derma-attain-years-label">
                          <label
                            htmlFor="graduate-basic"
                            className="email-text-field-label"
                            style={{
                              fontSize: "16px",
                              fontWeight: "600",
                              color: "#393939",
                              fontFamily: "Inter, sans-serif",
                            }}
                          >
                            Year of Graduation
                          </label>
                        </div>
                        <div className="derma-attain-years-textField">
                          <TextField
                            id="graduateAt"
                            value={formData.graduateAt}
                            onChange={(e) =>
                              handleInputChange({
                                target: {
                                  id: "graduateAt",
                                  value: e.target.value,
                                },
                              })
                            }
                            placeholder="Year of Graduation"
                            style={{
                              width: "100%",
                              minWidth: "253px",
                              height: "100%",
                              minHeight: "135px",
                              paddingLeft: "10px",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Accounts  */}
                <div className="text-field-row4">
                  <div className="derma-accounts-container">
                    {/* Account Header */}
                    <div className="derma-accounts-header">
                      <p>Accounts</p>
                    </div>
                    <div className="derma-accounts-password-container">
                      <div className="derma-accounts-password-row">
                        <div className="derma-accounts-password-icon">
                          <img src={passwordIcon} alt="password-icon" />
                        </div>
                        <div className="derma-accounts-password-label">
                          <p>Password:</p>
                        </div>
                        <div className="derma-accounts-password-button">
                          <button onClick={showChangePassword}>
                            Reset my password
                          </button>
                        </div>
                      </div>
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

export default Dermatologistprofile;
