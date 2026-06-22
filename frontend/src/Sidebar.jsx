import { useNavigate, useLocation } from "react-router-dom";

const menu = [
  { name: "Dashboard", path: "/a/dashboard" },
  { name: "Programs", path: "/a/programs" },
  { name: "Bookings", path: "/a/bookings" },
  { name: "Calendar", path: "/a/calendar" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/a/login");
  };

  return (
    <div className="w-64 shrink-0 bg-[#12101f] border-r border-white/10 p-6 flex flex-col justify-between">
      <div>
        <h1 className="text-2xl font-serif font-semibold tracking-tight text-[#f4e9d8] mb-2">
          Dhwani
        </h1>
        <p className="text-xs text-white/50 mb-10">Artist studio</p>

        <ul className="space-y-1">
          {menu.map((item) => (
            <li key={item.name}>
              <button
                type="button"
                onClick={() => navigate(item.path)}
                className={`w-full text-left cursor-pointer px-3 py-2 rounded-lg transition text-sm ${
                  location.pathname === item.path ||
                  (item.path === "/a/programs" &&
                    location.pathname.startsWith("/a/programs"))
                    ? "bg-[#c45c26]/25 text-[#f4d4bc] border border-[#c45c26]/40"
                    : "text-white/80 hover:bg-white/5"
                }`}
              >
                {item.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={logout}
        className="mt-8 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium"
      >
        Log out
      </button>
    </div>
  );
}
