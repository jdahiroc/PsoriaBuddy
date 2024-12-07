import express from "express";
import dotenv from "dotenv";
import admin from "firebase-admin";
import ZegoServerAssistant from "zego-server-assistant";

//  .env
dotenv.config();

const app = express();
app.use(express.json());

// Firebase Initialization
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.VITE_FIREBASE_PROJECT_ID,
        clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      }),
    });
  } catch (error) {
    console.error("Firebase Admin Initialization Error:", error.message);
    process.exit(1);
  }
}

// Generate ZegoCloud Token and Meeting Link
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

    const appID = parseInt(process.env.VITE_ZEGOCLOUD_APP_ID, 10);
    const appSign = process.env.VITE_ZEGOCLOUD_APP_SIGN;

    if (!appID || !appSign) {
      return res.status(500).json({ error: "Server misconfiguration." });
    }

    const userID =
      decodedToken.uid || `User-${Math.floor(Math.random() * 1000)}`;
    const userName = `User-${userID.substring(0, 6)}`;
    const expireTime = Math.floor(Date.now() / 1000) + 3600;

    const token = ZegoServerAssistant.generateKitTokenForProduction(
      appID,
      appSign,
      roomName,
      userID,
      userName,
      expireTime
    );

    const meetingLink = `https://zegocloud.com/meeting/${roomName}?access_token=${token}`;
    res.status(200).json({ meetingLink });
  } catch (error) {
    console.error("Token Generation Error:", error.message);
    res.status(500).json({ error: "Internal server error." });
  }
});

export default app;
