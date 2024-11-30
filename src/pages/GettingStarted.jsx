import "../styles/gettingstarted.css";

import Sidebar from "../pages/Sidebar/Sidebar";

import avatar from "../../src/assets/patient/patient-avatar.png";
import checkicon from "../../src/assets/patient/check-icon.png";

import { useState } from "react";
import { PlusOutlined } from "@ant-design/icons";
import { Image, Upload, DatePicker, Select, Space } from "antd";
import { Alert } from "antd";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const GettingStarted = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [fileList, setFileList] = useState([]);

  const [successAlert, setSuccessAlert] = useState(false);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const handleChange = ({ fileList: newFileList }) => {
    const validFiles = newFileList.filter(
      (file) => file.type === "image/jpeg" || file.type === "image/png"
    );
    setFileList(validFiles); // Only set valid files to the fileList state
  };

  //restrict user from upl
  const handleBeforeUpload = (file) => {
    const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
    if (!isJpgOrPng) {
      alert(
        "Only image files in .jpg or .png formats are supported. Please try again."
      );
    }
    return isJpgOrPng || Upload.LIST_IGNORE; // Prevent file from being added to fileList if invalid
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

  const handleSave = () => {
    // Show the alert when the save button is clicked
    setSuccessAlert(true);

    // hide the alert after a few seconds
    setTimeout(() => {
      setSuccessAlert(false);
    }, 3000);
  };

  return (
    <>
      <div className="getting-started-container">
        <Sidebar />
        <div className="getting-started-content">
          {/* FIRST SECTION */}
          {successAlert && (
            <div className="patient-alert">
              <Alert message="Profile Saved" type="success" showIcon />
            </div>
          )}
          <div className="getting-started-heading">
            {/* heading */}
            <div className="started-header">
              <h2>My Profile</h2>
            </div>
            {/* save button */}
            <div className="started-save" onClick={handleSave}>
              <button>
                Save profile <img src={checkicon} alt="check-icon" />
              </button>
            </div>
          </div>

          {/* SECOND SECTION */}
          <div className="getting-started-avatar">
            <div className="started-avatar">
              <img src={avatar} alt="started-img" />
              {/* Test Data */}
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

          {/* Third Content (Forms) */}
          <div className="getting-started-forms">
            {/* Left Section */}
            <div className="started-content">
              <div className="started-fullname">
                {/* Full Name */}
                <div className="started-fullname-label">
                  <label>Name</label>
                </div>
                <div className="started-fullname-input">
                  <input type="text" />
                </div>
              </div>
              {/* Username */}
              <div className="started-username">
                <div className="started-username-label">
                  <label>Username</label>
                </div>
                <div className="started-username-input">
                  <input type="text" />
                </div>
              </div>
              {/* Email */}
              <div className="started-email">
                <div className="started-email-label">
                  <label>Email</label>
                </div>
                <div className="started-email-input">
                  <input type="text" />
                </div>
              </div>

              {/* Gender & Birthday */}
              <div className="started-gender-birth-container">
                {/* Gender */}
                <div className="started-gender">
                  <div className="started-gender-label">
                    <label>Gender</label>
                  </div>
                  <div className="started-gender-input">
                    <Space>
                      <Select
                        defaultValue="Select gender"
                        style={{
                          width: 200,
                          height: 37,
                          marginTop: 7,
                        }}
                        allowClear
                        options={[
                          {
                            value: "Male",
                            label: "Male",
                          },
                          {
                            value: "Female",
                            label: "Female",
                          },
                          {
                            value: "Prefer not to say",
                            label: "Prefer not to say",
                          },
                          {
                            value: "Other",
                            label: "Other",
                          },
                        ]}
                      />
                    </Space>
                  </div>
                </div>
                {/* Birthday */}
                <div className="started-birthday">
                  <div className="started birthday-label">
                    <label>Birthday</label>
                  </div>
                  <div className="started-birthday-input">
                    <Space>
                      <DatePicker
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
            </div>
            {/* Right Section */}
            <div className="started-content-right">
              {/* Years of psoriasis */}
              <div className="started-years-of-psoriasis">
                <div className="started-years-of-psoriasis-label">
                  <label>
                    How many years have you had psoriasis? Is it genetic?
                  </label>
                </div>
                <div className="started-years-of-psoriasis-input">
                  <input type="text" />
                </div>
              </div>
              {/* Occupation */}
              <div className="started-occupation">
                <div className="started-occupation-label">
                  <label>
                    Occupation (e.g. student, teacher, engineer, etc.)
                  </label>
                </div>
                <div className="started-occupation-input">
                  <input type="text" />
                </div>
              </div>
              {/* Lifestyle habits */}
              <div className="started-lifestylehabits">
                <div className="started-lifestylehabits-label">
                  <label>
                    What are your lifestyle habits? ((eg. Smoker, for 2 years?))
                  </label>
                </div>
                <div className="started-lifestylehabits-input">
                  <input type="text" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GettingStarted;
