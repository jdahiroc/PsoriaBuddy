import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Room, RoomEvent } from "livekit-client";
import { Spin } from "antd";

const MeetingPage = () => {
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get the meeting link from query params
  const [searchParams] = useSearchParams();
  const meetingLink = decodeURIComponent(searchParams.get("link"));

  const joinRoom = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate the meeting link
      if (!meetingLink || !meetingLink.startsWith("wss://")) {
        setError("Invalid or missing meeting link.");
        setIsLoading(false);
        return;
      }

      // Extract token from the meeting link (optional check)
      const urlParams = new URLSearchParams(meetingLink.split("?")[1]);
      const accessToken = urlParams.get("access_token");
      if (!accessToken) {
        setError("Missing access token in the meeting link.");
        setIsLoading(false);
        return;
      }

      // Create a new LiveKit room instance
      const roomInstance = new Room();

      // Connect to the LiveKit room
      await roomInstance.connect(meetingLink);

      // Add event listeners
      roomInstance.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log(`Participant connected: ${participant.identity}`);
      });

      roomInstance.on(RoomEvent.Disconnected, () => {
        console.log("Disconnected from room");
        setConnected(false);
      });

      console.log("Connected to the room:", roomInstance);
      setRoom(roomInstance);
      setConnected(true);
    } catch (err) {
      console.error("Error connecting to LiveKit room:", err.message);
      setError("Failed to connect to the room. Please check the meeting link.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (room) {
        room.disconnect();
        console.log("Disconnected from the room.");
      }
    };
  }, [room]);

  return (
    <div>
      <h1>Meeting Page</h1>
      <Spin spinning={isLoading} tip="Connecting to the meeting...">
        {!connected && !isLoading && !error && (
          <button onClick={joinRoom}>Join Meeting</button>
        )}
        {connected && <p>Connected to the meeting!</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </Spin>
    </div>
  );
};

export default MeetingPage;
