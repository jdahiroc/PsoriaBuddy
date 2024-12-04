import "../styles/patientvideomeet.css";
// React Hooks
import { useState } from "react";
import { message } from "antd";
import ZegoUIKitPrebuilt from "@zegocloud/zego-uikit-prebuilt";

const PatientVideoMeet = () => {
  const [meetingLink, setMeetingLink] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = () => {
    //  Start loading
    setIsJoining(true);
    try {
      if (!meetingLink) {
        message.error("Please enter a meeting link.");
        return;
      }

      const url = new URL(meetingLink);
      const roomID = url.pathname.split("/")[2];
      const token = url.searchParams.get("access_token");

      if (!roomID || !token) {
        message.error(
          "The meeting link is invalid. Please check and try again."
        );
        return;
      }

      // Initialize Zego Prebuilt UI
      const appID = parseInt(process.env.REACT_APP_ZEGOCLOUD_APP_ID);

      if (!appID) {
        console.error(
          "App ID is missing. Ensure REACT_APP_ZEGOCLOUD_APP_ID is set."
        );
        message.error("An internal error occurred. Please try again later.");
        return;
      }

      const zp = ZegoUIKitPrebuilt.create(appID, token);
      zp.joinRoom({
        roomID,
        userID: `user-${Date.now()}`,
        userName: `Patient-${Math.floor(Math.random() * 1000)}`,
        container: document.getElementById("zego-container"), // Where the UI will load
      });

      //  Stop loading
      setIsJoining(false);
      console.log("Joining meeting:", { roomID, token });
      console.log("App ID:", appID);
      console.log("Room ID:", roomID);
      console.log("Token:", token);
    } catch (error) {
      //  Stop loading
      setIsJoining(false);
      console.error("Error parsing the meeting link:", error);
      message.error(
        "Invalid meeting link format. Ensure it starts with https://zegocloud.com/..."
      );
    }
  };

  return (
    <>
      <div className="patient-videomeet-container">
        <div className="patient-videomeet-contents">
          <div className="patient-videomeet-header">
            <h2>Video Call</h2>
          </div>
          <div className="patient-videomeet">
            {/* Left Section */}
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
                    disabled={isJoining}
                  >
                    {isJoining ? "Joining..." : "Join"}
                  </button>
                </div>
              </div>
            </div>
            {/* Right Section */}
            <div className="patient-videomeet-right-section">
              <div id="zego-container">
                {/* The meeting UI will load here */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PatientVideoMeet;
