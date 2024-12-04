import "../styles/patientvideomeet.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { message } from "antd";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const PatientVideoMeet = () => {
  //  Meeting Link State
  const [meetingLink, setMeetingLink] = useState("");
  //  Initialize Navigation
  const navigate = useNavigate();

  const handleJoin = () => {
    if (!meetingLink) {
      message.error("Please enter a meeting link.");
      return;
    }

    navigate(`/meeting?link=${encodeURIComponent(meetingLink)}`);
  };

  return (
    <div className="patient-videomeet-container">
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
                <button onClick={handleJoin} disabled={isJoining}>
                  {isJoining ? "Joining..." : "Join"}
                </button>
              </div>
            </div>
          </div>
          <div className="patient-videomeet-right-section">
            <div id="zego-container"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientVideoMeet;
