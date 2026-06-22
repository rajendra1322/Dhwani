import React, { useEffect, useState } from "react";
import Userhomehero from "./Userhomehero";
import Categories from "./Categories";
import LocationPicker from "./components/LocationPicker.jsx";
import HomeProgramsFeed from "./components/HomeProgramsFeed.jsx";
import HomeBookingsPreview from "./components/HomeBookingsPreview.jsx";
import API from "./api";

function UserHome() {
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loc, setLoc] = useState({ lat: 12.9716, lng: 77.5946 });

  useEffect(() => {
    API.get("/public/program-categories")
      .then((r) => setCategories(r.data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    API.get("/profile")
      .then((u) => {
        if (u?.location?.lat != null && u?.location?.lng != null) {
          setLoc({ lat: u.location.lat, lng: u.location.lng });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <Userhomehero />
      <section className="rounded-2xl border border-[#1e2a5e]/10 bg-white/80 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1e2a5e] mb-2">Your location</h2>
        <p className="text-sm text-[#5c4f3d] mb-4">
          Drop the pin for where you are planning the event. We use it to sort programs by
          distance (when artists set a venue). Your choice is saved to your profile.
        </p>
        <LocationPicker value={loc} onChange={setLoc} height={300} persistUserProfile />
      </section>
      <Categories
        categories={categories}
        selected={category}
        onSelect={setCategory}
      />
      <HomeProgramsFeed category={category} lat={loc.lat} lng={loc.lng} />
      <HomeBookingsPreview />
    </div>
  );
}

export default UserHome;
