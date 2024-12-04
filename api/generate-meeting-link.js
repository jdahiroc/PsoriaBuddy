import express from "express";
import dotenv from "dotenv";
import admin from "firebase-admin";
import ZegoServerAssistant from "zego-server-assistant";

dotenv.config();

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
    console.log("Firebase Admin initialized successfully.");
  } catch (error) {
    console.error("Error initializing Firebase Admin:", error.message);
    process.exit(1); // Stop the server if Firebase fails to initialize
  }
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
      console.error("Missing or invalid Authorization header.");
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    // Validate Room Name
    if (!roomName || typeof roomName !== "string" || roomName.trim() === "") {
      console.error("Invalid room name provided.");
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
      console.error("Invalid App ID or App Sign configuration.");
      return res.status(500).json({ error: "Invalid server configuration." });
    }

    console.log("App ID and App Sign validated successfully.");

    // Generate ZegoCloud Kit Token
    const userID = decodedToken.uid;
    const userName = `User-${Math.floor(Math.random() * 1000)}`;
    const expireTimeInSeconds = Math.floor(Date.now() / 1000) + 3600;

    console.log("Token Generation Inputs:", {
      appID,
      appSign,
      roomName,
      userID,
      userName,
      expireTimeInSeconds,
    });

    const kitToken = ZegoServerAssistant.generateKitTokenForProduction(
      appID,
      appSign,
      roomName,
      userID,
      userName,
      expireTimeInSeconds
    );

    if (!kitToken) {
      console.error("Failed to generate a valid kit token.");
      return res
        .status(500)
        .json({ error: "Failed to generate a valid meeting token." });
    }

    console.log("Kit Token generated successfully:", kitToken);

    // Generate Meeting Link
    const safeRoomName = encodeURIComponent(roomName.trim());
    const meetingLink = `https://zegocloud.com/meeting/${safeRoomName}?access_token=${kitToken}`;
    console.log("Generated Meeting Link:", meetingLink);

    res.status(200).json({ meetingLink });
  } catch (error) {
    console.error("Error in generate-meeting-link route:", error.message);
    res.status(500).json({ error: "Failed to generate meeting link." });
  }
});

export default app;
