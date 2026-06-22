import React, { useState } from 'react';
import image from './assets/backhome.png'
import { useNavigate } from 'react-router-dom';

function Userhomehero  ()  {
  const navigate = useNavigate();
  // states for dynamic value selection
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');

  // Handle the search action
  const handleSearch = () => {
    navigate("/u/artists");
  };

  return (
    <section 
      className="relative w-full overflow-hidden min-h-[500px] flex items-center bg-white"
      style={{
        // 1. Purple Swirls & Tint: We use a linear gradient for the tint
        // 2. Background Image: The URL of your artist illustration.
        backgroundImage:`linear-gradient(to right, rgba(249, 247, 255, 0.95), rgba(249, 247, 255, 0)), 
                          url(${image})`,
        backgroundSize: 'cover',        // Ensures the image covers the section
        backgroundPosition: 'right bottom', // Important to align the artists on the right
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-16 w-full relative z-10 py-20">
        
        {/* Main Heading */}
        <div className="max-w-2xl mb-10">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            <span className="text-[#3A1D71]">Book the perfect </span>
            <br />
            <span className="text-[#D98E27]">team for your event</span>
          </h1>
        </div>

        {/* Floating Search Bar (Controlled Components) */}
        <div className="inline-flex flex-col md:flex-row items-stretch bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden p-1 md:h-16 w-full md:w-auto">
          
          {/* Location Input (Controlled) */}
          <div className="flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-gray-100 min-w-[180px]">
            <span className="text-gray-400 mr-2">📍</span>
            <input 
              type="text" 
              placeholder="Thrissur" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="outline-none text-gray-700 w-full"
            />
          </div>

          {/* Category Input (Dropdown) */}
          <div className="flex items-center px-4 py-2 border-b md:border-b-0 md:border-r border-gray-100 min-w-[180px]">
            <span className="text-gray-400 mr-2">🎸</span>
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="outline-none text-gray-700 w-full bg-white"
            >
              <option value="">Select Event</option>
              <option value="chenda">Chenda Teams</option>
              <option value="saxophone">Saxophone Bands</option>
              <option value="dj">DJs</option>
              <option value="singers">Singers</option>
              <option value="photographers">Photographers</option>
            </select>
          </div>

          {/* Date Input */}
          <div className="flex items-center px-4 py-2 min-w-[180px]">
            <span className="text-gray-400 mr-2">📅</span>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="outline-none text-gray-700 w-full"
            />
          </div>

          {/* Search Button */}
          <button 
            onClick={handleSearch}
            className="bg-[#583294] text-white px-10 py-3 rounded-lg font-semibold hover:bg-[#452675] transition-colors m-1"
          >
            Search
          </button>
        </div>

        {/* Small subtitle link */}
        {/* <div className="mt-6">
          <a href="#" className="text-[#7D66A5] text-sm hover:underline ml-2">
            See videos
          </a>
        </div> */}
      </div>
    </section>
  );
};

export default Userhomehero;