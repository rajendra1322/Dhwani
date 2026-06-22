import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "leaflet/dist/leaflet.css";
import "./index.css";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import App from "./App.jsx";
import Users from "./Users.jsx";
import Login from "./Login.jsx";
import Register from "./Register.jsx";
import UserHome from "./UserHome.jsx";
import ArtistHome from "./ArtistHome.jsx";
import AdminHome from "./AdminHome.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Layout from "./Layout.jsx";
import AddProgram from "./AddProgram.jsx";
import UserLayout from "./UserLayout.jsx";
import BrowseArtists from "./pages/BrowseArtists.jsx";
import ArtistPublicPage from "./pages/ArtistPublicPage.jsx";
import UserBookings from "./pages/UserBookings.jsx";
import ArtistPrograms from "./pages/ArtistPrograms.jsx";
import ArtistCalendar from "./pages/ArtistCalendar.jsx";
import ArtistBookings from "./pages/ArtistBookings.jsx";
import { LegacyLoginRedirect, LegacyRegisterRedirect } from "./LegacyAuthRedirect.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/get-started" element={<Users />} />
        <Route path="/Users" element={<Navigate to="/get-started" replace />} />

        <Route path="/u/login" element={<Login />} />
        <Route path="/u/register" element={<Register />} />
        <Route path="/a/login" element={<Login />} />
        <Route path="/a/register" element={<Register />} />

        <Route path="/login/:role" element={<LegacyLoginRedirect />} />
        <Route path="/register/:role" element={<LegacyRegisterRedirect />} />

        <Route
          path="/admin/home"
          element={
            <ProtectedRoute role="admin">
              <AdminHome />
            </ProtectedRoute>
          }
        />
        <Route path="/adminhome" element={<Navigate to="/admin/home" replace />} />

        <Route path="/u" element={<UserLayout />}>
          <Route index element={<Navigate to="/u/artists" replace />} />
          <Route path="artists" element={<BrowseArtists />} />
          <Route path="artists/:artistId" element={<ArtistPublicPage />} />
          <Route
            path="home"
            element={
              <ProtectedRoute role="user">
                <UserHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="bookings"
            element={
              <ProtectedRoute role="user">
                <UserBookings />
              </ProtectedRoute>
            }
          />
        </Route>

        <Route
          path="/a"
          element={
            <ProtectedRoute role="artist">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<ArtistHome />} />
          <Route path="programs" element={<ArtistPrograms />} />
          <Route path="programs/new" element={<AddProgram />} />
          <Route path="calendar" element={<ArtistCalendar />} />
          <Route path="bookings" element={<ArtistBookings />} />
        </Route>

        <Route path="/userhome" element={<Navigate to="/u/home" replace />} />
        <Route path="/artisthome" element={<Navigate to="/a/dashboard" replace />} />
        <Route path="/programs" element={<Navigate to="/a/programs" replace />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
