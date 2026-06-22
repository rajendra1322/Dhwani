import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const user = readStoredUser();
  const location = useLocation();

  if (!token) {
    if (role === "artist") {
      return <Navigate to="/a/login" replace state={{ from: location }} />;
    }
    if (role === "user") {
      return <Navigate to="/u/login" replace state={{ from: location }} />;
    }
    return <Navigate to="/login/admin" replace state={{ from: location }} />;
  }

  if (role && user?.role !== role) {
    return <Navigate to="/get-started" replace />;
  }

  return children;
}
