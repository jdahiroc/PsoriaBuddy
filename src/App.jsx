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
import PostCreationDerma from "./pages/PostcreationDerma";
import ForgotPassword from "./pages/ForgotPassword";
// Dermatologist Routes
import DermatologistLogin from "./pages/Dermatologist/LoginDermatologist";
import DermatologistSignup from "./pages/Dermatologist/SignupDermatologist";
import VerificationPending from "./pages/VerificationPending";
import DermatologistProfile from "./pages/Dermatologist/Dermatologistprofile";
import DermatologistAppointment from "./pages/Dermatologist/DermatologistAppointment";
import DermatologistVideoMeet from "./pages/Dermatologist/DermatologistVideoMeet";
import DermatologistVerification from "./pages/Dermatologist/DermatologistVerification";
// Admin Routes
import AdminRoute from "./pages/ProtectedRoute/AdminRoute";
import AdminAccounts from "./pages/Admin/AdminAccounts";
import AdminAccountsVerification from "./pages/Admin/AdminAccountsVerification";
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
        <Route path="/post" element={<PostCreationAcc />} />
        <Route path="/d/post" element={<PostCreationDerma />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />

        {/* Pre-Join Setup Video Meeting Route */}
        <Route path="/prejoin" element={<MeetingPage />} />

        {/* Prevent access to Login & Signup when authenticated */}
        <Route element={<AuthRedirectRoute />}>
          <Route path="/login" element={<PatientLogin />} />
          <Route path="/signup" element={<PatientSignup />} />
          <Route path="/d/login" element={<DermatologistLogin />} />
          <Route path="/d/signup" element={<DermatologistSignup />} />
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
          {/* Verification Routes */}
          <Route
            path="/d/verification"
            element={<DermatologistVerification />}
          />
          <Route
            path="/d/verification-status"
            element={<VerificationPending />}
          />

          {/* Admin Routes */}
          <Route element={<AdminRoute />}>
            <Route path="/a/accounts" element={<AdminAccounts />} />
            <Route
              path="/a/accounts/verification"
              element={<AdminAccountsVerification />}
            />
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
