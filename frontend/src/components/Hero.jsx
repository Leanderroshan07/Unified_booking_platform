import React, { useEffect, useState } from 'react';
import SearchBar from './SearchBar';
import hotelBg from '../assets/hotal bg.jpg';

const Hero = () => {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        setLoaded(true);
    }, []);

    return (
        <section className="relative pt-32 pb-48 px-8 overflow-hidden">

            {/* Background Blobs */}
            <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-[#00d2ff]/10 rounded-full blur-[120px] animate-float opacity-40 pointer-events-none"></div>
            <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[150px] animate-float opacity-30 pointer-events-none" style={{ animationDelay: '2s' }}></div>

            <div className={`relative w-full max-w-7xl mx-auto rounded-[40px] overflow-hidden min-h-[500px] md:min-h-[600px] transition-all duration-1000 transform ${loaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>

                {/* Hero Background Image */}
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${hotelBg})` }}
                ></div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#030816]/90 via-[#030816]/40 to-transparent"></div>

                {/* Content */}
                <div className="relative h-full flex flex-col justify-center px-12 md:px-20 py-20 max-w-3xl">
                    <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
                        Enjoy your <span className="text-white glow-text">Dream</span> <br />
                        <span>Vacation</span>
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 font-medium mb-12">
                        Book Hotels, Flights and Stay packages at lowest price
                    </p>

                    {/* Booking Search Bar - Nested inside for glass effect consistency */}
                    <div className="w-full max-w-5xl">
                        <SearchBar activeTab="Hotels" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
