import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="relative flex min-h-screen overflow-x-hidden bg-[#fbfaf7] text-[#1c1b1a]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(30,42,94,0.08),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(196,92,38,0.10),_transparent_28%),linear-gradient(180deg,_#fbfaf7_0%,_#f8f5ef_100%)]" />
      <div className="pointer-events-none fixed inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(20,20,20,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,20,0.08)_1px,transparent_1px)] [background-size:38px_38px]" />

      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onClose={() => setMobileSidebarOpen(false)}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-black/10 bg-[#fbfaf7]/90 px-4 py-3 backdrop-blur md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-[#1e2a5e]">Dhwani</p>
              <p className="text-xs text-[#6b5b49]">Artist studio</p>
            </div>
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-black/10 bg-white text-[#1e2a5e] transition hover:bg-[#1e2a5e]/5"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 min-w-0 overflow-x-hidden px-4 py-5 sm:px-6 md:p-10">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
