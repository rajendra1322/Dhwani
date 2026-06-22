import React from 'react'
import bg from './assets/background.png'
import admin from './assets/adminpng.webp'
import artist from './assets/artist.webp'
import user from './assets/userone.webp'
import { useNavigate } from 'react-router-dom'

function Users() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen w-full bg-center bg-cover bg-no-repeat flex flex-col items-center"
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Title */}
      <p className="text-purple-700 font-bold border-b-2 border-purple-700
        text-3xl sm:text-4xl md:text-5xl lg:text-6xl
        mt-10 sm:mt-12 lg:mt-16 text-center px-4">
        Select your role
      </p>

      {/* Cards Container */}
      <div className="flex flex-col lg:flex-row items-center justify-center gap-10 mt-16 lg:mt-24 px-4">

        {/* Admin Card */}
        <div className="w-[280px] sm:w-[300px] md:w-[320px] h-auto bg-white rounded-2xl shadow-xl p-4
          hover:bg-[#323277ec] hover:text-white transition duration-500 hover:scale-105">
          
          <img src={admin} className="w-40 mx-auto mt-4" />

          <p className="text-2xl sm:text-3xl font-bold text-center mt-2">Admin</p>
          <p className="text-center text-sm sm:text-base mt-2">
            Manage Platform and Users
          </p>

          <button
            onClick={() => navigate('/login/admin')}
            className="w-full mt-6 py-2 border border-black font-bold hover:bg-white hover:text-black transition"
          >
            Sign In
          </button>
        </div>

        {/* Artist Card */}
        <div className="w-[280px] sm:w-[300px] md:w-[320px] bg-white rounded-2xl shadow-xl p-4
          hover:bg-[#323277ec] hover:text-white transition duration-500 hover:scale-105">

          <img src={artist} className="w-40 h-40 mx-auto rounded-full" />

          <p className="text-2xl sm:text-3xl font-bold text-center mt-2">Artist</p>
          <p className="text-center text-sm sm:text-base mt-2">
            List services & Get bookings
          </p>

          <button
            onClick={() => navigate('/a/login')}
            className="w-full mt-4 py-2 border border-black font-bold hover:bg-white hover:text-black"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate('/a/register')}
            className="w-full mt-3 py-2 bg-yellow-400 font-bold text-white hover:bg-white hover:text-black"
          >
            Register
          </button>
        </div>

        {/* User Card */}
        <div className="w-[280px] sm:w-[300px] md:w-[320px] bg-white rounded-2xl shadow-xl p-4
          hover:bg-[#323277ec] hover:text-white transition duration-500 hover:scale-105">

          <img src={user} className="w-40 h-40 mx-auto rounded-full" />

          <p className="text-2xl sm:text-3xl font-bold text-center mt-2">User</p>
          <p className="text-center text-sm sm:text-base mt-2">
            Book teams for your events
          </p>

          <button
            onClick={() => navigate('/u/login')}
            className="w-full mt-5 py-2 border border-black font-bold hover:bg-white hover:text-black"
          >
            Sign In
          </button>

          <button
            onClick={() => navigate('/u/register')}
            className="w-full mt-3 py-2 bg-yellow-400 font-bold text-white hover:bg-white hover:text-black"
          >
            Register
          </button>
        </div>

      </div>
    </div>
  )
}

export default Users