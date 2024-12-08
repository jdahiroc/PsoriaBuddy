import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const PreJoinSetup = () => {
  const [searchParams] = useSearchParams();
  const meetingLink = searchParams.get("link");
  const isJoined = useRef(false);

  useEffect(() => {
    if (!meetingLink || isJoined.current) return;

    try {
      const url = new URL(meetingLink); // Parse the meeting link
      const roomID = url.pathname.split("/")[2];
      const token = url.searchParams.get("access_token");

      if (!roomID || !token) {
        console.error("Error: Invalid meeting link structure.");
        message.error("Invalid meeting link. Please check the URL.");
        return;
      }

      const zp = ZegoUIKitPrebuilt.create(token);
      isJoined.current = true;

      // Join ZEGOCLOUD Video Conference
      zp.joinRoom({
        container: document.getElementById("zego-container"),
        scenario: { mode: ZegoUIKitPrebuilt.VideoConference },
      });
    } catch (error) {
      console.error("Error in PreJoinSetup:", error.message);
      message.error("Failed to join the meeting. Invalid meeting link.");
    }
  }, [meetingLink]);

  return (
    <div id="zego-container" style={{ width: "100vw", height: "100vh" }} />
  );
};

export default PreJoinSetup;
