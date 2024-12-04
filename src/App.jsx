// React Hooks
import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
// Protected Route
import ProtectedRoute from "./pages/ProtectedRoute/ProtectedRoute";
// Auth Redirect Route
import AuthRedirectRoute from "./pages/ProtectedRoute/AuthRedirectRoute";
// Homepage
import Homepage from "./pages/Homepage";
// Meeting Page for Livekit
import MeetingPage from "./pages/PreJoinSetup";

// Patient Routes
import GettingStarted from "./pages/GettingStarted";
import PatientProfile from "./pages/PatientProfile";
import PatientExperience from "./pages/MyExperience";
import PatientAppointment from "./pages/PatientAppointment";
import PatientVideoMeet from "./pages/PatientVideoMeet";
import PatientLogin from "./pages/Login";
import PatientSignup from "./pages/Signup";
import PostCreationAcc from "./pages/Postcreationacc";
import ForgotPassword from "./pages/ForgotPassword";
// Dermatologist Routes
import VerificationPending from "./pages/VerificationPending";
import DermatologistProfile from "./pages/Dermatologist/Dermatologistprofile";
import DermatologistAppointment from "./pages/Dermatologist/DermatologistAppointment";
import DermatologistVideoMeet from "./pages/Dermatologist/DermatologistVideoMeet";
// Admin Routes
import AdminRoute from "./pages/ProtectedRoute/AdminRoute";
import AdminAccounts from "./pages/Admin/AdminAccounts";
import AdminEvents from "./pages/Admin/AdminEvents";
// No Authorized Access Routes
import NoAuthorizedAccess from "./pages/Results/NotAuthorizedPage";
// App.jsx styles (CSS)
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/" index element={<Homepage />} />
        <Route path="/post-creation" element={<PostCreationAcc />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/d/verify" element={<VerificationPending />} />

        {/* Pre-Join Setup Video Meeting Route */}
        <Route path="/meeting" element={<MeetingPage />} />

        {/* Prevent access to Login & Signup when authenticated */}
        <Route element={<AuthRedirectRoute />}>
          <Route path="/login" element={<PatientLogin />} />
          <Route path="/signup" element={<PatientSignup />} />
        </Route>

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          {/* Patient Routes */}
          <Route path="/u/getting-started" element={<GettingStarted />} />
          <Route path="/u/profile" element={<PatientProfile />} />
          <Route path="/u/myexperience" element={<PatientExperience />} />
          <Route path="/u/appointment" element={<PatientAppointment />} />
          <Route path="/u/video" element={<PatientVideoMeet />} />

          {/* Dermatologist Routes */}

          {/* Only verified Dermatologists can access the following routes */}
          <Route path="/d/profile" element={<DermatologistProfile />} />
          <Route path="/d/appointment" element={<DermatologistAppointment />} />
          <Route path="/d/video" element={<DermatologistVideoMeet />} />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/a/accounts" element={<AdminAccounts />} />
            <Route path="/a/events" element={<AdminEvents />} />
          </Route>
          {/* Access Denied */}
          <Route path="/status/403" element={<NoAuthorizedAccess />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
