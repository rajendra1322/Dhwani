import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import AuthForm from "./components/AuthForm";
import API from "./api";

function resolveRole(pathname, paramRole) {
  if (paramRole) return paramRole;
  if (pathname.startsWith("/a")) return "artist";
  return "user";
}

function Register() {
  const { role: paramRole } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const role = resolveRole(location.pathname, paramRole);

  const handleRegister = async (data) => {
    try {
      await API.post("/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        role,
      });
      navigate(role === "artist" ? "/a/login" : "/u/login");
    } catch (err) {
      alert(err.response?.data?.message || "Register failed");
    }
  };

  return <AuthForm type="register" role={role} onSubmit={handleRegister} />;
}

export default Register;
