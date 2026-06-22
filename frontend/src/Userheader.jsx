import React, { useState, useEffect } from "react";
import logo from "./assets/frontlogo.png";
import { useNavigate, NavLink } from "react-router-dom";
import API from "./api";

function Userheader() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      return;
    }
    API.get("/profile")
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/u/login");
  };

  const firstLetter = user?.name?.charAt(0).toUpperCase() || "?";

  const linkClass = ({ isActive }) =>
    `font-medium transition ${
      isActive ? "text-[#1e2a5e]" : "text-[#5c4f3d] hover:text-[#1e2a5e]"
    }`;

  return (
    <nav className="bg-[#faf7f2]/95 px-4 md:px-8 py-4 border-b border-[#1e2a5e]/10 backdrop-blur">
      <div className="max-w-6xl mx-auto flex justify-between items-center gap-4">
        <button
          type="button"
          onClick={() => navigate("/u/home")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <img src={logo} alt="Dhwani" className="h-9 w-9 object-contain" />
          <span className="text-xl font-serif font-semibold text-[#1e2a5e]">Dhwani</span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          <NavLink to="/u/home" className={linkClass}>
            Home
          </NavLink>
          <NavLink to="/u/artists" className={linkClass}>
            Artists
          </NavLink>
          <NavLink to="/u/bookings" className={linkClass}>
            My bookings
          </NavLink>
        </div>

        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="w-9 h-9 bg-[#1e2a5e] text-[#faf7f2] flex items-center justify-center rounded-full text-sm font-semibold">
                {firstLetter}
              </div>
              <span className="text-sm font-medium text-[#2c2416] max-w-[140px] truncate">
                {user.name}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="px-3 py-2 text-sm rounded-lg border border-[#1e2a5e]/25 text-[#1e2a5e] hover:bg-[#1e2a5e]/5"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => navigate("/u/login")}
                className="px-4 py-2 text-sm rounded-lg border border-[#1e2a5e]/25 text-[#1e2a5e]"
              >
                Log in
              </button>
              <button
                type="button"
                onClick={() => navigate("/u/register")}
                className="px-4 py-2 text-sm rounded-lg bg-[#c45c26] text-white hover:bg-[#a34c1f]"
              >
                Sign up
              </button>
            </>
          )}
        </div>

        <button
          type="button"
          className="md:hidden text-[#1e2a5e]"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Menu"
        >
          <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden mt-4 pb-4 border-t border-[#1e2a5e]/10 pt-4 space-y-3 max-w-6xl mx-auto px-1">
          <NavLink to="/u/home" className="block" onClick={() => setIsOpen(false)}>
            Home
          </NavLink>
          <NavLink to="/u/artists" className="block" onClick={() => setIsOpen(false)}>
            Artists
          </NavLink>
          <NavLink to="/u/bookings" className="block" onClick={() => setIsOpen(false)}>
            My bookings
          </NavLink>
          {user ? (
            <button type="button" onClick={handleLogout} className="block w-full text-left">
              Log out
            </button>
          ) : (
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                className="flex-1 py-2 rounded-lg border border-[#1e2a5e]/25"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/u/login");
                }}
              >
                Log in
              </button>
              <button
                type="button"
                className="flex-1 py-2 rounded-lg bg-[#c45c26] text-white"
                onClick={() => {
                  setIsOpen(false);
                  navigate("/u/register");
                }}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Userheader;
