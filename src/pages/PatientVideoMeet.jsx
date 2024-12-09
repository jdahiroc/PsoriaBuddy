// Styles
import "../styles/patientvideomeet.css";
// React Hooks
import { useState } from "react";
import { useNavigate } from "react-router-dom";
// Ant Design Component
import { message } from "antd";
// Sidebar
import Sidebar from "../pages/Sidebar/Sidebar";
// Assets
import croods_keeping from "../assets/videocall/Croods_Keeping_In_Touch.png";

const PatientVideoMeet = () => {
  //  Meeting Link State
  const [meetingLink, setMeetingLink] = useState("");
  //  Initialize Navigation
  const navigate = useNavigate();

  //  HandleJoin Function
  // HandleJoin Function
  const handleJoin = () => {
    if (!meetingLink) {
      message.error("Please enter a meeting link.");
      return;
    }

    // Check if the link starts with "http://" or "https://"
    const isExternalLink =
      meetingLink.startsWith("http://") || meetingLink.startsWith("https://");

    if (isExternalLink) {
      // Open external meeting link in a new tab
      window.open(meetingLink, "_blank");
    } else {
      // Navigate to the internal prejoin link format
      navigate(`/prejoin?link=${encodeURIComponent(meetingLink)}`);
    }
  };

  return (
    <div className="patient-videomeet-container">
      <Sidebar />
      <div className="patient-videomeet-contents">
        <div className="patient-videomeet-header">
          <h2>Video Call</h2>
        </div>
        <div className="patient-videomeet">
          <div className="patient-videomeet-left-section">
            <div className="patient-videomeet-left-header">
              <h2>Private and secure video calls for your appointments.</h2>
            </div>
            <div className="patient-videomeet-left-subheader">
              <h4>Connect with our dermatologist using PsoriaBuddy</h4>
            </div>
            <div className="patient-videomeet-input-join-button-container">
              <div className="patient-videomeet-input">
                <input
                  type="text"
                  placeholder="Enter the meeting link"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                />
              </div>
              <div className="patient-videomeet-button">
                <button onClick={handleJoin}>Join</button>
              </div>
            </div>
          </div>
          {/* Right Section */}
          <div className="patient-videomeet-right-section">
            <div className="patient-videomeet-img">
              <img src={croods_keeping} alt="croods_keeping" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientVideoMeet;
