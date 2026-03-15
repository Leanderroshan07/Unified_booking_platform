import React from 'react';

const SearchBar = () => {
    return (
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-full max-w-5xl px-4 z-20">
            <div className="glass rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-2xl border border-white/10">

                {/* Location */}
                <div className="flex-1 w-full space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Location</label>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Where are you going?"
                            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 font-medium p-2"
                        />
                    </div>
                </div>

                <div className="hidden md:block w-px h-10 bg-white/10"></div>

                {/* Check In */}
                <div className="flex-1 w-full space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Check In</label>
                    <input
                        type="text"
                        placeholder="Add dates"
                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 font-medium p-2"
                    />
                </div>

                <div className="hidden md:block w-px h-10 bg-white/10"></div>

                {/* Check Out */}
                <div className="flex-1 w-full space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Check Out</label>
                    <input
                        type="text"
                        placeholder="Add dates"
                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 font-medium p-2"
                    />
                </div>

                <div className="hidden md:block w-px h-10 bg-white/10"></div>

                {/* Guests */}
                <div className="flex-1 w-full space-y-1">
                    <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Guests</label>
                    <input
                        type="text"
                        placeholder="Add guests"
                        className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-500 font-medium p-2"
                    />
                </div>

                {/* Search Button */}
                <button className="bg-white text-black w-14 h-14 rounded-full flex items-center justify-center hover:bg-[#00d2ff] hover:text-white transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(0,210,255,0.5)] group">
                    <svg className="w-6 h-6 transform transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </button>

            </div>
        </div>
    );
};

export default SearchBar;
