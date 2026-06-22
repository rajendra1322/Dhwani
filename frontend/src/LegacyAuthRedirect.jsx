import { Navigate, useParams } from "react-router-dom";
import Login from "./Login.jsx";

/** Maps old `/login/:role` (non-admin) to `/u/*` or `/a/*`. Admin keeps this URL. */
export function LegacyLoginRedirect() {
  const { role } = useParams();
  if (role === "admin") return <Login />;
  if (role === "artist") return <Navigate to="/a/login" replace />;
  if (role === "user") return <Navigate to="/u/login" replace />;
  return <Navigate to="/get-started" replace />;
}

export function LegacyRegisterRedirect() {
  const { role } = useParams();
  if (role === "artist") return <Navigate to="/a/register" replace />;
  if (role === "user") return <Navigate to="/u/register" replace />;
  return <Navigate to="/get-started" replace />;
}
