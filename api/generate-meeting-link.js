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
      clientEmail: process.env.VITE_FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.VITE_FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const app = express();
app.use(express.json());

// API for generating a Zegocloud token and meeting link
app.post("/api/generate-meeting-link", async (req, res) => {
  try {
    const { roomName } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    if (!roomName || typeof roomName !== "string" || roomName.trim() === "") {
      return res
        .status(400)
        .json({ error: "Room name is required and must be a valid string." });
    }

    console.log("Room Name:", roomName);
    console.log("Decoded Token:", decodedToken);

    const appID = process.env.VITE_ZEGOCLOUD_APP_ID;
    const appSign = process.env.VITE_ZEGOCLOUD_APP_SIGN;

    if (!appID || !appSign) {
      console.error("App ID or App Sign is missing in environment variables.");
      return res.status(500).json({
        error: "Server configuration error: Missing App ID or App Sign.",
      });
    }

    console.log("App ID:", appID);
    console.log("App Sign exists:", !!appSign);

    const expireTime = Math.floor(Date.now() / 1000) + 3600;
    const payload = `${appID}${decodedToken.uid}${roomName}${expireTime}`;
    console.log("Token Payload:", payload);

    const signature = crypto
      .createHmac("sha256", appSign)
      .update(payload)
      .digest("hex");
    console.log("Token Signature:", signature);

    const token = `${appID}-${decodedToken.uid}-${expireTime}-${signature}`;
    console.log("Generated Token:", token);

    if (!token) {
      console.error("Failed to generate a valid token.");
      return res
        .status(500)
        .json({ error: "Failed to generate a valid meeting token." });
    }

    const meetingLink = `https://zegocloud.com/meeting/${roomName}?access_token=${token}`;
    console.log("Generated Meeting Link:", meetingLink);

    res.status(200).json({ meetingLink });
  } catch (error) {
    console.error("Error generating meeting link:", error.message);
    res.status(500).json({ error: "Failed to generate meeting link." });
  }
});

export default app;
