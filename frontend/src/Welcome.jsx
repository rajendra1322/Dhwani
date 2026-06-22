import React from 'react'
import bg from './assets/background.png'
import dhwanilogo from './assets/fnllogo.png'
import { useNavigate } from 'react-router-dom'

function Welcome() {
    const navigate = useNavigate();

    const handlegetstart = () => {
        navigate("/get-started");
    }

    return (
        <div
            className="h-screen w-full bg-cover bg-center flex items-center justify-center px-4"
            style={{ backgroundImage: `url(${bg})` }}
        >

            
            <div className="
                w-full 
                max-w-[350px] sm:max-w-[450px] md:max-w-[550px] lg:max-w-[600px]
                p-6 sm:p-8 md:p-10
                bg-[#ffffffc9] rounded-3xl
                shadow-xl shadow-blue-400 backdrop-blur-xl
                text-center
            ">

                {/* Logo */}
                <img
                    src={dhwanilogo}
                    alt="dhwanilogo"
                    className="
                        w-[180px] sm:w-[250px] md:w-[320px] lg:w-[400px]
                        mx-auto
                        mb-4
                    "
                />

                {/* Heading */}
                <h2 className="
                    text-purple-900 font-bold
                    text-xl sm:text-2xl md:text-3xl lg:text-4xl
                ">
                    Welcome to Dhwani Events
                </h2>

                {/* Subtitle */}
                <p className="
                    text-purple-950 mt-2
                    text-sm sm:text-base md:text-lg lg:text-xl
                ">
                    Where every celebration finds its rhythm.
                </p>

                {/* Button */}
                <button
                    onClick={handlegetstart}
                    className="
                        mt-6
                        w-full sm:w-[80%] md:w-[70%] lg:w-[60%]
                        bg-purple-900 hover:bg-purple-800
                        text-white font-bold
                        py-3 rounded-lg
                        transition transform hover:scale-105 duration-300
                        shadow-lg
                    "
                >
                    Get Started
                </button>

            </div>
        </div>
    )
}

export default Welcome