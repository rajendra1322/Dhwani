import { X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const menu = [
  { name: "Dashboard", path: "/a/dashboard" },
  { name: "Programs", path: "/a/programs" },
  { name: "Bookings", path: "/a/bookings" },
  { name: "Calendar", path: "/a/calendar" },
];

export default function Sidebar({ mobileOpen, onClose }) {
  const navigate = useNavigate();
  const location = useLocation();

  const goTo = (path) => {
    navigate(path);
    onClose?.();
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/a/login");
    onClose?.();
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/25 backdrop-blur-[1px] md:hidden"
          aria-label="Close sidebar overlay"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-black/10 bg-[#fbfaf7]/95 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-transform duration-300 ease-out md:static md:z-auto md:flex md:w-64 md:shrink-0 md:flex-col md:justify-between md:p-6 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        aria-hidden={mobileOpen ? false : undefined}
      >
        <div>
          <div className="mb-8 flex items-start justify-between gap-3 md:mb-10">
            <div>
              <h1 className="text-2xl font-serif font-semibold tracking-tight text-[#1e2a5e]">
                Dhwani
              </h1>
              <p className="text-xs text-[#6b5b49]">Artist studio</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-[#1e2a5e] transition hover:bg-[#1e2a5e]/5 md:hidden"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <ul className="space-y-1">
            {menu.map((item) => (
              <li key={item.name}>
                <button
                  type="button"
                  onClick={() => goTo(item.path)}
                  className={`w-full cursor-pointer rounded-xl px-3.5 py-3 text-left text-sm transition ${
                    location.pathname === item.path ||
                    (item.path === "/a/programs" &&
                      location.pathname.startsWith("/a/programs"))
                      ? "border border-[#c45c26]/25 bg-[#fff3ea] text-[#c45c26]"
                      : "text-[#1c1b1a] hover:bg-[#1e2a5e]/5 hover:text-[#1e2a5e]"
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
          className="mt-8 w-full rounded-xl border border-black/10 bg-white py-2.5 text-sm font-medium text-[#1e2a5e] transition hover:bg-[#1e2a5e]/5"
        >
          Log out
        </button>
      </aside>
    </>
  );
}
