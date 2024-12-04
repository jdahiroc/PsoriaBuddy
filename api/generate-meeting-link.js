import express from "express";
import dotenv from "dotenv";
import crypto from "crypto";
import admin from "firebase-admin";

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      clientEmail: process.env.VITE_FIREBASE_PROJECT_ID,
      privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const app = express();
app.use(express.json());

// API for generating a ZegoCloud token and meeting link
app.post("/api/generate-meeting-link", async (req, res) => {
  try {
    const { roomName } = req.body;
    const authHeader = req.headers.authorization;

    // Validate Authorization Header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Validate Room Name
    if (!roomName || typeof roomName !== "string" || roomName.trim() === "") {
      return res
        .status(400)
        .json({ error: "Room name is required and must be a valid string." });
    }

    console.log("Room Name:", roomName);
    console.log("Decoded Token:", decodedToken);

    // Validate Environment Variables
    const appID = parseInt(process.env.VITE_ZEGOCLOUD_APP_ID, 10);
    const appSign = process.env.VITE_ZEGOCLOUD_APP_SIGN;

    if (!appID || !appSign || appSign.length !== 64) {
      console.error(
        "Invalid App ID or App Sign. Check your environment variables."
      );
      return res.status(500).json({ error: "Invalid server configuration." });
    }

    console.log("App ID:", appID);
    console.log("App Sign is valid.");

    // Token Generation
    const expireTime = Math.floor(Date.now() / 1000) + 3600; // Token valid for 1 hour
    const payload = `${appID}${decodedToken.uid}${roomName}${expireTime}`;
    console.log("Token Payload:", payload);

    const signature = crypto
      .createHmac("sha256", appSign)
      .update(payload)
      .digest("hex");
    console.log("Token Signature:", signature);

    const userID = encodeURIComponent(decodedToken.uid);
    const token = `${appID}-${userID}-${expireTime}-${signature}`;
    console.log("Generated Token:", token);

    if (!token) {
      console.error("Failed to generate a valid token.");
      return res
        .status(500)
        .json({ error: "Failed to generate a valid meeting token." });
    }

    // Generate Meeting Link
    const safeRoomName = encodeURIComponent(roomName.trim());
    const meetingLink = `https://zegocloud.com/meeting/${safeRoomName}?access_token=${token}`;
    console.log("Generated Meeting Link:", meetingLink);

    // Respond with Meeting Link
    res.status(200).json({ meetingLink });
  } catch (error) {
    console.error("Error generating meeting link:", error.message);
    res.status(500).json({ error: "Failed to generate meeting link." });
  }
});

export default app;
