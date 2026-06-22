import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import API from "./api";

function resolveRole(pathname, paramRole) {
  if (paramRole) return paramRole;
  if (pathname.startsWith("/a")) return "artist";
  return "user";
}

function Login() {
  const { role: paramRole } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const role = resolveRole(location.pathname, paramRole);

  const handleLogin = async (data) => {
    try {
      const res = await API.post("/login", {
        email: data.email,
        password: data.password,
        role,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      const userRole = res.data.user.role;

      if (userRole === "admin") {
        navigate("/admin/home");
      } else if (userRole === "artist") {
        navigate("/a/dashboard");
      } else {
        navigate("/u/home");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return <AuthForm type="login" role={role} onSubmit={handleLogin} />;
}

export default Login;
