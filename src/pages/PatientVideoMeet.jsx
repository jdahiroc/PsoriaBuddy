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
      const url = new URL(meetingLink);
      const roomID = url.pathname.split("/")[2];
      const token = url.searchParams.get("access_token");

      if (!roomID || !token) {
        throw new Error("Invalid meeting link structure.");
      }

      const tokenParts = token.split("-");
      const appID = parseInt(tokenParts[0], 10);
      const userID = tokenParts[1];
      const expireTime = tokenParts[2];
      const signature = tokenParts[3];

      console.log("Room ID:", roomID);
      console.log("Token Parts:", tokenParts);
      console.log("App ID:", appID);

      const zpToken = ZegoUIKitPrebuilt.generateKitTokenForProduction(
        appID,
        signature,
        roomID,
        userID,
        `Patient-${Math.floor(Math.random() * 1000)}`
      );

      const zp = ZegoUIKitPrebuilt.create(zpToken);
      zp.joinRoom({
        container: document.getElementById("zego-container"),
        roomID,
        userID: `user-${Date.now()}`,
        userName: `Patient-${Math.floor(Math.random() * 1000)}`,
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
      });
    } catch (error) {
      console.error("Error joining the meeting:", error);
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
