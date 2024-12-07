import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import axios from "axios";

dotenv.config();

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { roomName } = req.body;

      if (!roomName) {
        return res.status(400).json({ error: "Room name is required." });
      }

      const appID = process.env.VITE_ZEGOCLOUD_APP_ID;
      const serverSecret = process.env.VITE_ZEGOCLOUD_APP_SIGN;

      if (!appID || !serverSecret) {
        return res.status(500).json({ error: "Server misconfiguration." });
      }

      // Call ZEGOCLOUD REST API to generate the meeting token
      const response = await axios.post("https://zegocloud-api.com/token", {
        app_id: appID,
        server_secret: serverSecret,
        room_name: roomName,
        expiration: 3600, // 1-hour token
      });

      const token = response.data.token;
      const meetingLink = `https://meeting.zego.im/${roomName}?access_token=${token}`;

      res.status(200).json({ meetingLink });
    } catch (error) {
      console.error("Token Generation Error:", error.message);
      res
        .status(500)
        .json({
          error: "Failed to generate meeting link.",
          details: error.message,
        });
    }
  } else {
    res.status(405).json({ error: "Method Not Allowed" });
  }
}

// export default app;
