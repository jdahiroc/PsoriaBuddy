import express from "express";
import dotenv from "dotenv";
import admin from "firebase-admin";
import ZegoServerAssistant from "zego-server-assistant"; // Import ZegoServerAssistant

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
  } catch (firebaseError) {
    console.error("Error initializing Firebase Admin:", firebaseError);
    throw new Error("Failed to initialize Firebase Admin.");
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
    console.log("Decoded Firebase Token:", decodedToken);

    // Validate Environment Variables
    const appID = parseInt(process.env.VITE_ZEGOCLOUD_APP_ID, 10);
    const appSign = process.env.VITE_ZEGOCLOUD_APP_SIGN;

    if (!appID || !appSign || appSign.length !== 64) {
      console.error("Invalid App ID or App Sign:", {
        appID,
        appSign,
        appSignLength: appSign.length,
      });
      return res.status(500).json({ error: "Invalid server configuration." });
    }

    console.log("App ID and App Sign validated.");

    // Generate Kit Token
    const userID = decodedToken.uid;
    const userName = `User-${Math.floor(Math.random() * 1000)}`;
    const expireTimeInSeconds = Math.floor(Date.now() / 1000) + 3600;

    console.log("Token Generation Inputs:", {
      appID,
      appSign,
      roomName,
      userID: decodedToken.uid,
      userName,
      expireTimeInSeconds,
    });

    const kitToken = ZegoServerAssistant.generateKitTokenForProduction(
      appID,
      appSign,
      roomName,
      decodedToken.uid, // Use Firebase UID
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
    console.error("Error generating meeting link:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
    res.status(500).json({ error: "Failed to generate meeting link." });
  }
});

export default app;
