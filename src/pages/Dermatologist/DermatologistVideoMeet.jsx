import "../../css/dermatologistvideomeet.css";

import Sidebar from "../../pages/Sidebar/DSidebar";

// React Hooks
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Assets
import croods_keeping from "../../assets/videocall/Croods_Keeping_In_Touch.png";

const DermatologistVideoMeet = () => {
  //  Meeting Link State
  const [meetingLink, setMeetingLink] = useState("");
  // Initialize navigate
  const navigate = useNavigate();

  //  HandleJoin Function
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
    <>
      <div className="dermatologist-videomeet-container">
        <Sidebar />
        <div className="dermatologist-videomeet-contents">
          <div className="dermatologist-videomeet-header">
            <h2>Video Call</h2>
          </div>
          <div className="dermatologist-videomeet">
            {/* Left Section */}
            <div className="dermatologist-videomeet-left-section">
              {/* Header */}
              <div className="dermatologist-videomeet-left-header">
                <h2>Private and secure video calls for your appointments.</h2>
              </div>
              <div className="dermatologist-videomeet-left-subheader">
                <h4>Connect with your patient using PsoriaBuddy</h4>
              </div>
              {/* Input & Join Button */}
              <div className="dermatologist-videomeet-input-join-button-container">
                <div className="dermatologist-videomeet-input">
                  <input
                    type="text"
                    placeholder="Enter the meeting link"
                    value={meetingLink}
                    onChange={(e) => setMeetingLink(e.target.value)}
                  />
                </div>
                <div className="dermatologist-videomeet-button">
                  <button onClick={handleJoin}>Join</button>
                </div>
              </div>
            </div>
            {/* Right Section */}
            <div className="dermatologist-videomeet-right-section">
              <div className="dermatologist-videomeet-img">
                <img src={croods_keeping} alt="croods_keeping" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DermatologistVideoMeet;
