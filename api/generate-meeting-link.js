import { AccessToken } from "livekit-server-sdk";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

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
        return res.status(401).json({ error: "Unauthorized" });
      }

      const idToken = authHeader.split("Bearer ")[1];

      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("Authenticated user:", decodedToken);

      if (!roomName) {
        return res.status(400).json({ error: "Room name is required" });
      }

      // Generate a LiveKit token
      const apiKey = process.env.VITE_LIVEKIT_API_KEY;
      const apiSecret = process.env.VITE_LIVEKIT_SECRET;

      const identity = decodedToken.uid; // Use Firebase UID as identity
      const token = new AccessToken(apiKey, apiSecret, { identity });

      // Add necessary grants (permissions)
      token.addGrant({
        roomJoin: true,
        room: roomName,
      });

      // Generate the JWT token
      const jwtToken = token.toJwt();

      // Construct the meeting link
      const meetingLink = `${process.env.VITE_LIVEKIT_URL}/?access_token=${jwtToken}`;

      console.log("Generated Meeting Link:", meetingLink);

      // Send the meeting link to the frontend
      res.status(200).json({ meetingLink });
    } catch (error) {
      console.error("Error generating meeting link:", error);
      res.status(500).json({ error: "Failed to generate meeting link" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
