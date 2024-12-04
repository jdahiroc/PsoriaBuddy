import "../styles/patientvideomeet.css";
import { useState } from "react";
import { message } from "antd";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const PatientVideoMeet = () => {
  const [meetingLink, setMeetingLink] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async () => {
    setIsJoining(true);
    try {
      // Parse meeting link
      const url = new URL(meetingLink);
      const roomID = url.pathname.split("/")[2];
      const token = url.searchParams.get("access_token");

      if (!roomID || !token) {
        throw new Error("Invalid meeting link structure");
      }

      console.log("Room ID:", roomID);
      console.log("Token:", token);

      // Validate token structure
      const tokenParts = token.split("-");
      console.log("Token Parts:", tokenParts);
      if (tokenParts.length !== 4) {
        throw new Error("Invalid token format");
      }

      // Retrieve app ID
      const appID = parseInt(import.meta.env.VITE_ZEGOCLOUD_APP_ID, 10);
      console.log("App ID:", appID);

      if (!appID) {
        throw new Error("Missing App ID");
      }

      // Initialize ZegoUIKitPrebuilt
      const zp = ZegoUIKitPrebuilt.create({
        appID,
        token,
      });

      zp.joinRoom({
        container: document.getElementById("zego-container"),
        roomID,
        userID: `user-${Date.now()}`,
        userName: `Patient-${Math.floor(Math.random() * 1000)}`,
      });

      console.log("Joining room:", { appID, roomID, token });
    } catch (error) {
      console.error("Error initializing ZegoUIKitPrebuilt:", error);
      message.error(
        "Failed to join the meeting. Please verify the meeting link and try again."
      );
    } finally {
      setIsJoining(false);
    }
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
