import express from "express";
import cors from "cors";
import admin from "firebase-admin";
import { AccessToken } from "livekit-server-sdk";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

const app = express();

dotenv.config();

// Middleware
app.use(cors());

app.use(express.json()); // For parsing JSON requests

// Endpoint to generate meeting link
app.post("/generate-meeting-link", async (req, res) => {
  try {
    const { roomName } = req.body;

    if (!roomName) {
      return res.status(400).json({ error: "Room name is required" });
    }

    // Generate a LiveKit token
    const apiKey = process.env.VITE_LIVEKIT_API_KEY;
    const apiSecret = process.env.VITE_LIVEKIT_SECRET;

    const identity = `user-${Date.now()}`; // Unique identity for the participant
    const token = new AccessToken(apiKey, apiSecret, { identity });

    // Add necessary grants (permissions)
    token.addGrant({
      roomJoin: true,
      room: roomName,
    });

    // Generate the JWT token
    const jwtToken = await token.toJwt();

    // Construct the meeting link
    const meetingLink = `${process.env.VITE_LIVEKIT_URL}/?access_token=${jwtToken}`;

    console.log("Generated Meeting Link:", meetingLink);

    // Send the meeting link to the frontend
    res.json({ meetingLink });
  } catch (error) {
    console.error("Error generating meeting link:", error);
    res.status(500).json({ error: "Failed to generate meeting link" });
  }
});

// Start the Express server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});
