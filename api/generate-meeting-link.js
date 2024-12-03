import admin from "firebase-admin";
import dotenv from "dotenv";
import axios from "axios";

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

export default async function handler(req, res) {
  if (req.method === "POST") {
    try {
      const { roomName } = req.body;
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: Missing token" });
      }

      const idToken = authHeader.split("Bearer ")[1];

      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      if (!roomName) {
        return res.status(400).json({ error: "Room name is required" });
      }

      // ZegoCloud API Setup
      const appID = process.env.ZEGOCLOUD_APP_ID;
      const serverSecret = process.env.ZEGOCLOUD_SERVER_SECRET;
      const expiration = Math.floor(Date.now() / 1000) + 3600; // Token expires in 1 hour

      // Generate a ZegoCloud access token
      const response = await axios.post(
        "https://zego-api.zegocloud.com/v1/token",
        {
          app_id: appID,
          server_secret: serverSecret,
          room_name: roomName,
          expiration,
        }
      );

      console.log("ZegoCloud API Response:", response.data);

      if (response.data && response.data.token) {
        const meetingLink = `https://psoria-buddy.vercel.app/meeting/${roomName}?access_token=${response.data.token}`;


        // Return the generated meeting link
        res.status(200).json({ meetingLink });
      } else {
        throw new Error("Failed to retrieve token from ZegoCloud");
      }
    } catch (error) {
      console.error("Error generating meeting link:", error.message);
      res.status(500).json({ error: "Failed to generate meeting link" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
