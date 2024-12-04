import React, { useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const PreJoinSetup = () => {
  const [searchParams] = useSearchParams();
  const meetingLink = searchParams.get("link");
  const isJoined = useRef(false); // Ensure `joinRoom` is only called once

  useEffect(() => {
    if (!meetingLink || isJoined.current) return;

    try {
      const url = new URL(meetingLink);
      const roomID = url.pathname.split("/")[2];
      const token = url.searchParams.get("access_token");

      if (!roomID || !token) {
        console.error("Invalid meeting link or missing token.");
        return;
      }

      const kitToken = token; // Use the token directly if it's pre-generated
      const zp = ZegoUIKitPrebuilt.create(kitToken);

      isJoined.current = true; // Prevent multiple calls to joinRoom
      zp.joinRoom({
        container: document.getElementById("zego-container"),
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
      });
    } catch (error) {
      console.error("Error during joinRoom:", error);
    }
  }, [meetingLink]);

  return (
    <div id="zego-container" style={{ width: "100vw", height: "100vh" }} />
  );
};

export default PreJoinSetup;
