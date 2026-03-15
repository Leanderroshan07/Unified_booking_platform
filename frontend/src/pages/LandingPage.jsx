import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import HotelCard from '../components/HotelCard';
import hotelService from '../services/hotelService';

const LandingPage = () => {
    const [searchParams] = useSearchParams();
    const locationQuery = searchParams.get('location') || '';
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHotels = async () => {
            setLoading(true);
            try {
                const data = await hotelService.getHotels();
                if (locationQuery) {
                    const filtered = data.filter(h =>
                        h.location.toLowerCase().includes(locationQuery.toLowerCase()) ||
                        h.name.toLowerCase().includes(locationQuery.toLowerCase())
                    );
                    setHotels(filtered);
                } else {
                    setHotels(data);
                }
            } catch (error) {
                console.error("Error fetching hotels:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHotels();
    }, [locationQuery]);

    return (
        <div className="min-h-screen bg-[#030816]">
            <Navbar />

            <main>
                <Hero />

                {/* Popular Hotels Section */}
                <section className="max-w-7xl mx-auto px-8 py-24">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 glow-text uppercase tracking-widest">
                            {locationQuery ? `Hotels in "${locationQuery}"` : "Popular Hotels"}
                        </h2>
                        <div className="w-24 h-1 bg-[#00d2ff] mx-auto rounded-full"></div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#00d2ff]"></div>
                        </div>
                    ) : hotels.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 text-white">
                            {hotels.map(hotel => (
                                <HotelCard key={hotel._id} hotel={hotel} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-20 text-gray-400">
                            <p className="text-xl">No hotels found {locationQuery ? `in "${locationQuery}"` : ""}.</p>
                            <p className="mt-2 text-sm italic">Check back later for new luxury additions.</p>
                        </div>
                    )}
                </section>
            </main>

            <footer className="border-t border-white/5 py-12 px-8 text-center text-gray-500 text-sm">
                <p>&copy; 2026 Allu&Co. Luxury Travel Experience.</p>
            </footer>
        </div>
    );
};

export default LandingPage;
