import "../../css/dermatologistvideomeet.css";

import Sidebar from "../../pages/Sidebar/DSidebar";

// React Hooks
import { useNavigate } from "react-router-dom";

// Assets
import croods_keeping from "../../assets/videocall/Croods_Keeping_In_Touch.png";

const DermatologistVideoMeet = () => {
  // Initialize navigate
  const navigate = useNavigate();

  // Handles the join button
  const handleJoin = (link) => {
    if (link.startsWith("wss://")) {
      const encodedLink = encodeURIComponent(link);
      navigate(`/meeting?link=${encodedLink}`);
    } else {
      alert("Invalid meeting link. Make sure it starts with 'wss://'.");
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
                    className="dermatologist-videomeet-input"
                    id="meetingLink"
                  />
                </div>
                <div className="dermatologist-videomeet-button">
                  <button
                    className="dermatologist-videomeet-join-button"
                    onClick={() =>
                      handleJoin(document.getElementById("meetingLink").value)
                    }
                  >
                    Join
                  </button>
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
