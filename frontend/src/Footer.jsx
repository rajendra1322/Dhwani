import React from 'react';
import dhwanilogo from './assets/frontlogo.png'

const Footer = () => {
  return (
    /* CHANGE: Removed rounded-t-[4rem] 
       ADDED: rounded-none (for a flat top) 
    */
    <footer className="w-full bg-gradient-to-r from-[#3A1D71] to-[#6B39A8] text-white py-12 px-6 md:px-16 mt-0 rounded-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center md:items-start justify-between gap-10">
        
        {/* 1. Logo and Small Tagline */}
        <div className="flex flex-col items-center md:items-start space-y-2 border-r-0 md:border-r border-white/20 md:pr-10">
           <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center overflow-hidden">
               <img src={dhwanilogo} alt="Dhwani Logo" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold ">
              Dhwani
            </h2>
          </div>
        </div>

        {/* 2. Main Slogan Section */}
        <div className="flex-1 text-center md:text-left md:pl-8">
          <p className="text-xl md:text-2xl font-medium leading-tight">
            Feel the sound. <br />
            Book the celebration.
          </p>
        </div>

        {/* 3. Navigation Links and Social Icons */}
        <div className="flex flex-col items-center md:items-end space-y-6">
          {/* Top Row: Links */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-sm font-medium text-gray-100">
            <a href="#" className="hover:text-[#E69D37] transition underline-offset-4 hover:underline">About Us</a>
            <a href="#" className="hover:text-[#E69D37] transition underline-offset-4 hover:underline">FAQs</a>
            <a href="#" className="hover:text-[#E69D37] transition underline-offset-4 hover:underline">Contact</a>
            <a href="#" className="hover:text-[#E69D37] transition underline-offset-4 hover:underline">Terms</a>
            <a href="#" className="hover:text-[#E69D37] transition underline-offset-4 hover:underline">Privacy Policy</a>
          </div>

          {/* Bottom Row: Social Icons */}
          <div className="flex space-x-4">
            {['f', 't', 'ig', 'in'].map((social) => (
              <a 
                key={social}
                href="#" 
                className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center hover:bg-[#E69D37] hover:text-[#3A1D71] transition-all duration-300"
              >
                <span className="text-xs uppercase font-bold">{social}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/40 gap-4">
        <p>© 2026 DhwaniEvents. All rights reserved.</p>
        <div className="flex gap-6">
           <span>English (US)</span>
           <span>Privacy Settings</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;