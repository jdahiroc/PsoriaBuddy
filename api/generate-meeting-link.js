import express from "express";
import admin from "firebase-admin";
import { generateToken04 } from "../api/zegoServerAssistant";

const router = express.Router();

router.post("/generate-meeting-link", async (req, res) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;

    // Validate authorization header
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ 
        error: "Unauthorized: Missing or invalid token",
        details: "Authorization header must start with 'Bearer '"
      });
    }

    // Extract the token
    const idToken = authHeader.split("Bearer ")[1];

    try {
      // Verify Firebase ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Extract room name from request body
      const { roomName } = req.body;

      // Validate room name
      if (!roomName) {
        return res.status(400).json({ 
          error: "Bad Request", 
          details: "Room name is required" 
        });
      }

      // Retrieve environment variables with error checking
      const appID = process.env.VITE_ZEGOCLOUD_APP_ID 
        ? parseInt(process.env.VITE_ZEGOCLOUD_APP_ID, 10) 
        : null;
      const serverSecret = process.env.VITE_ZEGOCLOUD_APP_SIGN;

      // Validate ZegoCloud credentials
      if (!appID || !serverSecret) {
        return res.status(500).json({ 
          error: "Server Configuration Error", 
          details: "Missing ZegoCloud credentials" 
        });
      }

      // Generate user ID (using Firebase UID or a fallback)
      const userID = decodedToken.uid || `User-${Math.floor(Math.random() * 1000)}`;
      
      // Set token expiration (1 hour from now)
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

      // Construct meeting link
      const meetingLink = `https://meeting.zego.im/${roomName}?access_token=${token}`;

      // Respond with meeting link
      res.status(200).json({ 
        meetingLink, 
        message: "Meeting link generated successfully" 
      });

    } catch (tokenVerificationError) {
      // Handle Firebase token verification errors
      console.error("Token Verification Error:", tokenVerificationError);
      return res.status(401).json({ 
        error: "Authentication Failed", 
        details: tokenVerificationError.message 
      });
    }

  } catch (error) {
    // Catch any unexpected errors
    console.error("Unexpected Error in Meeting Link Generation:", error);
    res.status(500).json({ 
      error: "Internal Server Error", 
      details: error.message 
    });
  }
});

export default router;