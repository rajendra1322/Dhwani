import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

export default function Layout() {
  return (
    <div className="flex min-h-screen bg-[#1a1530] text-[#faf7f2]">
      <Sidebar />
      <div className="flex-1 min-w-0 p-6 md:p-10 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
