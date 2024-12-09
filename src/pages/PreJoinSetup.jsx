import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { message } from "antd"; // Ant Design notification for user feedback

const PreJoinSetup = () => {
  const [searchParams] = useSearchParams();
  const meetingLink = searchParams.get("link");
  const isJoined = useRef(false);

  useEffect(() => {
    if (!meetingLink || isJoined.current) return;

    try {
      // Parse the meeting link
      const url = new URL(meetingLink);
      const roomID = url.pathname.split("/")[1]; // Extract room name
      const accessToken = url.searchParams.get("access_token"); // Extract token

      if (!roomID || !accessToken) {
        console.error("Error: Invalid meeting link structure.");
        message.error("Invalid meeting link. Please check the URL.");
        return;
      }

      // ZegoUIKitPrebuilt Initialization
      const zp = ZegoUIKitPrebuilt.create(accessToken);
      isJoined.current = true;

      zp.joinRoom({
        container: document.getElementById("zego-container"),
        sharedLinks: [
          {
            name: "Copy Meeting Link",
            url: meetingLink,
          },
        ],
        scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
      });
    } catch (error) {
      console.error("Error in PreJoinSetup:", error.message);
      message.error("Failed to join the meeting. Invalid meeting link.");
    }
  }, [meetingLink]);

  return (
    <div
      id="zego-container"
      style={{ width: "100vw", height: "100vh", backgroundColor: "#F5F5F5" }}
    />
  );
};

export default PreJoinSetup;
