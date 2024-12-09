import express from "express";
import dotenv from "dotenv";
import admin from "firebase-admin";
import { generateToken04 } from "../api/zegoServerAssistant";
import cors from "cors";

// Load environment variables
dotenv.config();

// Create Express app
const app = express();

// Middleware
app.use(cors());
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

const corsOptions = {
  origin: "*", // Allow all origins (test only)
  methods: ["POST", "GET", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Generate ZEGOCLOUD Token and Meeting Link
app.post("/api/generate-meeting-link", async (req, res) => {
  try {
    const { roomName } = req.body;
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing token" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    try {
      console.log("Received ID Token:", idToken);
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("Decoded Token:", decodedToken);
    } catch (authError) {
      console.error("Firebase Auth Token Verification Failed:", authError);
      return res.status(401).json({
        error: "Unauthorized: Invalid token",
        details: authError.message,
      });
    }

    const appID = parseInt(process.env.VITE_ZEGOCLOUD_APP_ID, 10);
    const serverSecret = process.env.VITE_ZEGOCLOUD_APP_SIGN;

    const userID =
      decodedToken.uid || `User-${Math.floor(Math.random() * 1000)}`;
    const expireTime = Math.floor(Date.now() / 1000) + 3600;

    try {
      console.log("ZEGOCLOUD AppID:", appID);
      console.log("ZEGOCLOUD Server Secret:", serverSecret);

      const token = generateToken04(
        appID,
        userID,
        serverSecret,
        expireTime,
        JSON.stringify({
          room_id: roomName,
          privilege: { 1: 1, 2: 1 },
          stream_id_list: [],
        })
      );

      console.log("Generated Token:", token);
    } catch (zegoError) {
      console.error("ZEGOCLOUD Token Generation Error:", zegoError);
      throw zegoError;
    }

    const meetingLink = `https://meeting.zego.im/${roomName}?access_token=${token}`;
    res.status(200).json({ meetingLink });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

export default app;
