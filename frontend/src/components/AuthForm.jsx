import React, { useState } from "react";
import bg from "../assets/background.png";
import { useNavigate } from "react-router-dom";

function AuthForm({ type, role, onSubmit }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-center bg-cover px-4"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Glass Card */}
      <div className="
        w-full max-w-[380px] sm:max-w-[420px] md:max-w-[450px]
        backdrop-blur-lg bg-white/20 border border-white/30
        shadow-2xl rounded-3xl
        p-6 sm:p-8 md:p-10
        transition duration-500 hover:scale-105
      ">

        <h2 className="
          text-center font-bold text-purple-800 capitalize
          text-2xl sm:text-3xl md:text-4xl
          mb-6
        ">
          {type === "login" ? "Sign in" : "Create account"}{" "}
          {role === "user"
            ? "as attendee"
            : role === "artist"
              ? "as artist"
              : `as ${role}`}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {type === "register" && (
            <input
              type="text"
              name="name"
              placeholder="Enter Name"
              onChange={handleChange}
              className="w-full px-3 py-2 sm:py-3 rounded-lg outline-none border border-gray-300 focus:border-purple-500"
            />
          )}

          <input
            type="email"
            name="email"
            placeholder="Enter Email"
            onChange={handleChange}
            className="w-full px-3 py-2 sm:py-3 rounded-lg outline-none border border-gray-300 focus:border-purple-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Enter Password"
            onChange={handleChange}
            className="w-full px-3 py-2 sm:py-3 rounded-lg outline-none border border-gray-300 focus:border-purple-500"
          />

          <button
            className="
              w-full py-2 sm:py-3 mt-2
              bg-purple-700 text-white font-bold
              rounded-lg hover:bg-purple-900 transition
            "
          >
            {type === "login" ? "Sign In" : "Register"}
          </button>

        </form>

        <button
          type="button"
          onClick={() => navigate("/get-started")}
          className="
            text-sm sm:text-base text-purple-700 underline
            mt-4 block mx-auto hover:text-purple-900
          "
        >
          ← Back
        </button>

      </div>
    </div>
  );
}

export default AuthForm;