import { Outlet } from "react-router-dom";
import Userheader from "./Userheader";
import Footer from "./Footer";

export default function UserLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Userheader />
      <main className="flex-1 container-page py-8">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
