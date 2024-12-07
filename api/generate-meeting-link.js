import express from "express";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { generateToken04 } from "../api/zegoServerAssistant";

dotenv.config();

const app = express();
app.use(express.json());

// Firebase Initialization
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: import.meta.env.VITE_FIREBASE_CLIENT_EMAIL,
        privateKey: import.meta.env.VITE_FIREBASE_PRIVATE_KEY.replace(
          /\\n/g,
          "\n"
        ),
      }),
    });
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error.message);
    process.exit(1);
  }
}

// Generate ZEGOCLOUD Token and Meeting Link
app.post("/api/generate-meeting-link", async (req, res) => {
  try {
    const { roomName } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!roomName) {
      return res.status(400).json({ error: "Room name is required." });
    }

    const appID = parseInt(import.meta.env.VITE_ZEGOCLOUD_APP_ID, 10);
    const serverSecret = import.meta.env.VITE_ZEGOCLOUD_APP_SIGN;

    if (!appID || !serverSecret) {
      return res.status(500).json({ error: "Server misconfiguration." });
    }

    const userID =
      decodedToken.uid || `User-${Math.floor(Math.random() * 1000)}`;
    const expireTime = Math.floor(Date.now() / 1000) + 3600;

    // Generate ZEGOCLOUD Token
    const token = generateToken04(
      appID,
      userID,
      serverSecret,
      expireTime,
      JSON.stringify({
        room_id: roomName,
        privilege: {
          1: 1, // Allow login
          2: 1, // Allow publishing
        },
        stream_id_list: [],
      })
    );

    console.log("App ID:", appID);
    console.log("Server Secret:", serverSecret);
    console.log("Room Name:", roomName);
    console.log("User ID:", userID);

    const meetingLink = `https://meeting.zego.im/${roomName}?access_token=${token}`;
    res.status(200).json({ meetingLink });
  } catch (error) {
    console.error("Token Generation Error:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default app;
