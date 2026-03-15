import React from 'react';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '../utils/media';
import { formatINR } from '../utils/currency';

const HotelCard = ({ hotel }) => {
    const getImageUrl = (img) => {
        if (!img) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800';
        return getOptimizedImageUrl(img, { width: 800 });
    };

    return (
        <Link to={`/hotels/${hotel._id}`} className="block group relative rounded-3xl overflow-hidden glass-card transition-all duration-500 hover:-translate-y-2">
            <div className="aspect-[4/3] overflow-hidden">
                <img
                    src={getImageUrl(hotel.images[0])}
                    alt={hotel.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                />
            </div>

            <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="text-xl font-bold text-white group-hover:text-[#00d2ff] transition-colors">{hotel.name}</h3>
                        <p className="text-sm text-gray-400 flex items-center gap-1 mt-1">
                            {/* SVG icon remains same */}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {hotel.location}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-gray-500 uppercase font-bold block mb-1">Per Night</span>
                        <span className="text-lg font-bold text-white">{formatINR(hotel.price)}</span>
                    </div>
                </div>
            </div>

            <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#00d2ff]/30 rounded-3xl pointer-events-none transition-all duration-500"></div>
        </Link>
    );
};

export default HotelCard;
