import React, { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";

const PreJoinSetup = () => {
  const [searchParams] = useSearchParams();
  const meetingLink = searchParams.get("link");

  useEffect(() => {
    if (!meetingLink) return;

    const url = new URL(meetingLink);
    const roomID = url.pathname.split("/")[2];
    const token = url.searchParams.get("access_token");

    const zp = ZegoUIKitPrebuilt.create(token);
    zp.joinRoom({
      container: document.getElementById("zego-container"),
      roomID,
      userID: `user-${Date.now()}`,
      userName: `Patient-${Math.floor(Math.random() * 1000)}`,
    });
  }, [meetingLink]);

  return (
    <div id="zego-container" style={{ width: "100vw", height: "100vh" }}>
      {/* The Zego pre-join UI will render here */}
    </div>
  );
};

export default PreJoinSetup;
