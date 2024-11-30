import "../styles/patientvideomeet.css";
// React Hooks
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Sidebar from "../pages/Sidebar/Sidebar";

// Assets
import croods_keeping from "../assets/videocall/Croods_Keeping_In_Touch.png";

const PatientVideoMeet = () => {
  const [meetingLink, setMeetingLink] = useState("");

  const handleJoin = () => {
    if (meetingLink.startsWith("wss://")) {
      const encodedLink = encodeURIComponent(meetingLink);
      navigate(`/videocall?link=${encodedLink}`);
    } else {
      alert("Invalid meeting link. Please provide a valid WebSocket link.");
    }
  };

  return (
    <>
      <div className="patient-videomeet-container">
        <Sidebar />
        <div className="patient-videomeet-contents">
          <div className="patient-videomeet-header">
            <h2>Video Call</h2>
          </div>
          <div className="patient-videomeet">
            {/* Left Section */}
            <div className="patient-videomeet-left-section">
              {/* Header */}
              <div className="patient-videomeet-left-header">
                <h2>Private and secure video calls for your appointments.</h2>
              </div>
              <div className="patient-videomeet-left-subheader">
                <h4>Connect with our dermatologist using PsoriaBuddy</h4>
              </div>
              {/* Input & Join Button  */}
              <div className="patient-videomeet-input-join-button-container">
                <div className="patient-videomeet-input">
                  <input
                    type="text"
                    placeholder="Enter the meeting code or link"
                    className="patient-videomeet-input"
                    id="meetingLink"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                </div>
                <div className="patient-videomeet-button">
                  <button
                    className="patient-videomeet-join-button"
                    onClick={handleJoin}
                  >
                    Join
                  </button>
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
    </>
  );
};

export default PatientVideoMeet;
