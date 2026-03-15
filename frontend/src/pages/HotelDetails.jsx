import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Star, MapPin, Plane, Utensils, ShieldCheck,
    Wifi, AirVent, Dumbbell, Car, Coffee, Users,
    Maximize, Bed, Bath, Trees, ChevronRight, ChevronLeft,
    CheckCircle2, Clock, CreditCard, CalendarDays, Moon
} from 'lucide-react';
import Navbar from '../components/Navbar';
import hotelService from '../services/hotelService';
import Carousel from '../components/Carousel';
import { getOptimizedImageUrl } from '../utils/media';
import { formatINR } from '../utils/currency';

const HotelDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('rooms');
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedRoomId, setSelectedRoomId] = useState(null);
    const [checkInDate, setCheckInDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [stayNights, setStayNights] = useState(3);

    const roomsRef = useRef(null);
    const amenitiesRef = useRef(null);
    const reviewsRef = useRef(null);
    const policiesRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const hotelData = await hotelService.getHotelById(id);
                setHotel(hotelData);
                const roomsData = await hotelService.getRoomsByHotel(id);
                setRooms(roomsData);
            } catch (error) {
                console.error("Error fetching hotel details:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    useEffect(() => {
        if (rooms.length > 0 && !selectedRoomId) {
            setSelectedRoomId(rooms[0]._id);
        }
    }, [rooms, selectedRoomId]);

    const scrollToSection = (ref, tab) => {
        setActiveTab(tab);
        ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const getImageUrl = (img) => {
        if (!img) return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800';
        return getOptimizedImageUrl(img, { width: 1200 });
    };

    if (loading) return (
        <div className="min-h-screen bg-[#030816] flex justify-center items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
    );

    if (!hotel) return (
        <div className="min-h-screen bg-[#030816] text-white flex flex-col justify-center items-center">
            <h2 className="text-2xl font-bold mb-4">Hotel Not Found</h2>
            <button onClick={() => navigate('/hotels')} className="bg-orange-500 px-6 py-2 rounded-full">Back to Search</button>
        </div>
    );

    const fallbackBasePrice = Number(hotel.price) || 4500;
    const fallbackRooms = [
        {
            id: 'fallback-normal',
            type: 'Normal Room',
            capacity: 2,
            price: fallbackBasePrice,
            taxes: Math.round(fallbackBasePrice * 0.12),
            size: '220 sq.ft',
            bedType: 'Queen Bed',
            view: 'City View',
            coupleFriendly: true,
            mealPlans: ['Room Only'],
            images: hotel.images,
        },
        {
            id: 'fallback-deluxe',
            type: 'Deluxe Room',
            capacity: 2,
            price: Math.round(fallbackBasePrice * 1.35),
            taxes: Math.round(fallbackBasePrice * 0.16),
            size: '320 sq.ft',
            bedType: 'King Bed',
            view: 'Garden View',
            coupleFriendly: true,
            mealPlans: ['Breakfast Included'],
            images: hotel.images,
        },
        {
            id: 'fallback-luxury',
            type: 'Luxury Suite',
            capacity: 3,
            price: Math.round(fallbackBasePrice * 2),
            taxes: Math.round(fallbackBasePrice * 0.24),
            size: '450 sq.ft',
            bedType: 'King Bed',
            view: 'Sea View',
            coupleFriendly: true,
            mealPlans: ['Breakfast + Dinner'],
            images: hotel.images,
        },
    ];

    const roomList = rooms.length > 0 ? rooms : fallbackRooms;
    const orderedRoomList = [...roomList].sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    const selectedRoom = orderedRoomList.find((room) => (room._id || room.id) === selectedRoomId) || orderedRoomList[0];
    const selectedRoomIndex = orderedRoomList.findIndex((room) => (room._id || room.id) === (selectedRoom?._id || selectedRoom?.id));

    const moveRoomSelection = (direction) => {
        if (orderedRoomList.length === 0) {
            return;
        }

        const currentIndex = selectedRoomIndex >= 0 ? selectedRoomIndex : 0;
        const nextIndex = (currentIndex + direction + orderedRoomList.length) % orderedRoomList.length;
        const nextRoom = orderedRoomList[nextIndex];
        setSelectedRoomId(nextRoom._id || nextRoom.id);
    };

    const totalNights = Math.max(1, Number(stayNights) || 1);
    const selectedRoomNightly = Number(selectedRoom?.price || hotel.price || 0);
    const selectedRoomTaxes = Number(selectedRoom?.taxes || 0);
    const bookingTotal = (selectedRoomNightly + selectedRoomTaxes) * totalNights;

    const selectedDateLabel = new Date(`${checkInDate}T00:00:00`).toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    const handleReserveNow = () => {
        if (!selectedRoom) return;

        const payload = {
            hotel: hotel._id,
            room: selectedRoom._id,
            roomType: selectedRoom.type,
            checkInDate,
            nights: totalNights,
            guests: {
                adults: 2,
                children: 1,
            },
            pricePerNight: selectedRoomNightly,
            taxesPerNight: selectedRoomTaxes,
            totalPrice: bookingTotal,
        };

        const hotelInfo = {
            name: hotel.name,
            location: hotel.location,
            image: getImageUrl(selectedRoom?.images?.[0] || hotel.images?.[0]),
            dateLabel: selectedDateLabel,
        };

        navigate('/hotel-payment', {
            state: {
                hotelBookingData: payload,
                hotelInfo,
            },
        });
    };

    return (
        <div className="min-h-screen bg-[#F0F2F5] pb-20">
            <Navbar />

            {/* Header Section */}
            <div className="bg-white pt-24 pb-8 shadow-sm">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                {Array.from({ length: hotel.starCategory || 3 }).map((_, i) => (
                                    <Star key={i} size={16} className="fill-orange-400 text-orange-400" />
                                ))}
                                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-2">Hotel</span>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{hotel.name}</h1>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1 font-medium">
                                    <MapPin size={16} className="text-orange-500" />
                                    {hotel.location}
                                </span>
                                {hotel.distanceFromAirport && (
                                    <span className="flex items-center gap-1">
                                        <Plane size={16} />
                                        {hotel.distanceFromAirport} from Airport
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-end">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-gray-500 uppercase">Excellent</span>
                                    <span className="bg-green-600 text-white font-bold px-2 py-1 rounded-lg text-lg">
                                        {hotel.rating || '4.2'}
                                    </span>
                                </div>
                                <span className="text-xs text-blue-600 font-medium hover:underline cursor-pointer">
                                    {hotel.reviews?.length || 120} Ratings
                                </span>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button className="border border-blue-600 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-blue-50 transition-colors">
                                    View Map
                                </button>
                                <button onClick={() => scrollToSection(reviewsRef, 'reviews')} className="border border-blue-600 text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold hover:bg-blue-50 transition-colors">
                                    Reviews
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gallery Section */}
            <div className="max-w-7xl mx-auto px-6 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4 h-[500px]">
                <div className="lg:col-span-2 relative group overflow-hidden rounded-3xl shadow-xl">
                    <AnimatePresence mode="wait">
                        <motion.img
                            key={currentImageIndex}
                            src={getImageUrl(hotel.images[currentImageIndex])}
                            className="w-full h-full object-cover"
                            decoding="async"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.5 }}
                        />
                    </AnimatePresence>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>

                    <button
                        onClick={() => setCurrentImageIndex(prev => (prev > 0 ? prev - 1 : hotel.images.length - 1))}
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronLeft />
                    </button>
                    <button
                        onClick={() => setCurrentImageIndex(prev => (prev < hotel.images.length - 1 ? prev + 1 : 0))}
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <ChevronRight />
                    </button>

                    <div className="absolute bottom-6 right-6 bg-black/60 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur-md">
                        {currentImageIndex + 1} / {hotel.images.length} Photos
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    {hotel.images.slice(1, 3).map((img, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx + 1)}
                            className="relative flex-1 overflow-hidden rounded-3xl shadow-lg cursor-pointer group"
                        >
                            <img
                                src={getImageUrl(img)}
                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                loading="lazy"
                                decoding="async"
                            />
                            <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent"></div>
                            {idx === 0 && (
                                <div className="absolute bottom-4 left-4 text-white font-bold drop-shadow-lg">Room Photos</div>
                            )}
                            {idx === 1 && (
                                <div className="absolute bottom-4 left-4 text-white font-bold drop-shadow-lg">Outdoor Photos</div>
                            )}
                        </div>
                    ))}
                    {hotel.images.length > 3 && (
                        <div className="relative flex-1 overflow-hidden rounded-3xl shadow-lg cursor-pointer group bg-gray-200 flex justify-center items-center">
                            <img
                                src={getImageUrl(hotel.images[3])}
                                className="absolute inset-0 w-full h-full object-cover opacity-40"
                                loading="lazy"
                                decoding="async"
                            />
                            <div className="relative text-gray-900 font-bold text-xl">+ {hotel.images.length - 3} More</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Sticky Room Summary Card (Floating on smaller screens, sidebar on large) */}
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10 items-start">
                <div className="lg:col-span-2">
                    {/* Navigation Tabs */}
                    <div className="sticky top-20 z-40 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm mb-8 border border-gray-100 overflow-hidden">
                        <div className="flex overflow-x-auto scrollbar-hide">
                            {[
                                { id: 'rooms', label: 'Room Options', ref: roomsRef },
                                { id: 'amenities', label: 'Amenities', ref: amenitiesRef },
                                { id: 'reviews', label: 'Guest Reviews', ref: reviewsRef },
                                { id: 'policies', label: 'Property Policies', ref: policiesRef },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => scrollToSection(tab.ref, tab.id)}
                                    className={`px-8 py-5 text-sm font-bold whitespace-nowrap transition-all relative ${activeTab === tab.id ? 'text-orange-500' : 'text-gray-500 hover:text-gray-900'
                                        }`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTabScroll"
                                            className="absolute bottom-0 left-0 right-0 h-1 bg-orange-500"
                                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Room Options Section */}
                    <section ref={roomsRef} className="space-y-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold font-serif text-gray-900">Recommended Rooms</h2>
                            <span className="text-gray-500 text-sm">{orderedRoomList.length} Room types available</span>
                        </div>

                        <div className="rounded-[32px] bg-gradient-to-b from-orange-50/60 to-white p-4 border border-orange-100/80">
                            <div className="flex items-center justify-between gap-3 mb-4">
                                <button
                                    type="button"
                                    onClick={() => moveRoomSelection(-1)}
                                    className="h-11 w-11 rounded-2xl border border-orange-200 bg-white text-orange-600 flex items-center justify-center shadow-sm hover:bg-orange-50 transition-colors"
                                    aria-label="Previous room"
                                >
                                    <ChevronLeft size={18} />
                                </button>

                                <div className="flex-1 overflow-x-auto no-scrollbar">
                                    <div className="flex items-center gap-2 min-w-max px-1">
                                        {orderedRoomList.map((room) => {
                                            const roomId = room._id || room.id;
                                            const isSelected = roomId === (selectedRoom?._id || selectedRoom?.id);

                                            return (
                                                <button
                                                    key={roomId}
                                                    type="button"
                                                    onClick={() => setSelectedRoomId(roomId)}
                                                    className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all ${isSelected
                                                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/25'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'
                                                        }`}
                                                >
                                                    {room.type}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => moveRoomSelection(1)}
                                    className="h-11 w-11 rounded-2xl border border-orange-200 bg-white text-orange-600 flex items-center justify-center shadow-sm hover:bg-orange-50 transition-colors"
                                    aria-label="Next room"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={selectedRoom?._id || selectedRoom?.id || selectedRoom?.type}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.35, ease: 'easeOut' }}
                                    className="bg-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-md transition-shadow group"
                                >
                                    <div className="flex flex-col md:flex-row">
                                        <div className="md:w-1/3 relative h-64 md:h-auto overflow-hidden">
                                            <img
                                                src={getImageUrl(selectedRoom?.images?.[0])}
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-gray-800 flex items-center gap-1 shadow-sm">
                                                <Maximize size={12} /> {selectedRoom?.size || '320 sq.ft'}
                                            </div>
                                        </div>
                                        <div className="md:w-2/3 p-8">
                                            <div className="flex justify-between items-start mb-6 gap-4">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedRoom?.type}</h3>
                                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1"><Users size={16} /> Up to {selectedRoom?.capacity} Guests</span>
                                                        <span className="flex items-center gap-1"><Bed size={16} /> {selectedRoom?.bedType || 'King Bed'}</span>
                                                        {selectedRoom?.view && <span className="flex items-center gap-1"><Trees size={16} /> {selectedRoom.view}</span>}
                                                    </div>
                                                </div>
                                                {selectedRoom?.coupleFriendly && (
                                                    <span className="bg-pink-50 text-pink-600 px-3 py-1 rounded-full text-xs font-bold border border-pink-100 italic">Couple Friendly</span>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-50">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-green-600 text-sm font-bold">
                                                        <CheckCircle2 size={16} />
                                                        Free Cancellation
                                                    </div>
                                                    <p className="text-xs text-gray-500 ml-6">Before {new Date(selectedRoom?.freeCancellationDate || Date.now() + 86400000).toLocaleDateString('en-IN')}</p>
                                                    <div className="flex items-center gap-2 text-blue-600 text-sm font-bold">
                                                        <Utensils size={16} />
                                                        {selectedRoom?.mealPlans?.[0] || 'Room Only'}
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-gray-400 text-sm line-through">{formatINR(Math.round((Number(selectedRoom?.price) || 0) * 1.2))}</p>
                                                    <div className="flex items-baseline justify-end gap-1">
                                                        <span className="text-3xl font-bold text-gray-900">{formatINR(selectedRoom?.price)}</span>
                                                        <span className="text-gray-500 text-sm font-medium">/ night</span>
                                                    </div>
                                                    <p className="text-gray-400 text-xs mb-4">+ {formatINR(selectedRoom?.taxes || 0)} taxes & fees</p>
                                                    <button
                                                        onClick={() => setSelectedRoomId(selectedRoom?._id || selectedRoom?.id)}
                                                        className="w-full py-3 rounded-2xl font-bold shadow-lg active:scale-95 transition-all bg-gray-900 text-white shadow-gray-900/20"
                                                    >
                                                        Selected
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </section>

                    {/* Premium Amenities Carousel Section */}
                    <section ref={amenitiesRef} className="mt-16 bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
                        <h2 className="text-2xl font-bold mb-10 text-gray-900 border-l-4 border-orange-500 pl-4">Premium Amenities</h2>
                        <div className="flex justify-center">
                            <Carousel
                                items={[
                                    {
                                        id: 1,
                                        title: 'High Speed WiFi',
                                        description: 'Complimentary high-speed internet throughout the property.',
                                        icon: <Wifi className="h-[16px] w-[16px] text-white" />,
                                        image: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&q=80&w=600'
                                    },
                                    {
                                        id: 2,
                                        title: 'Air Conditioning',
                                        description: 'Climate-controlled rooms with individual temperature settings.',
                                        icon: <AirVent className="h-[16px] w-[16px] text-white" />,
                                        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&q=80&w=600'
                                    },
                                    {
                                        id: 3,
                                        title: 'Modern Gym',
                                        description: 'State-of-the-art fitness center with personal trainers.',
                                        icon: <Dumbbell className="h-[16px] w-[16px] text-white" />,
                                        image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&q=80&w=600'
                                    },
                                    {
                                        id: 4,
                                        title: 'Airport Shuttle',
                                        description: 'Complimentary luxury airport transfer service.',
                                        icon: <Car className="h-[16px] w-[16px] text-white" />,
                                        image: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&q=80&w=600'
                                    },
                                    {
                                        id: 5,
                                        title: 'Breakfast Buffet',
                                        description: 'International breakfast buffet with live cooking stations.',
                                        icon: <Coffee className="h-[16px] w-[16px] text-white" />,
                                        image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&q=80&w=600'
                                    },
                                    {
                                        id: 6,
                                        title: 'Luxury Bathtub',
                                        description: 'Premium soaking tubs with bath amenities and robes.',
                                        icon: <Bath className="h-[16px] w-[16px] text-white" />,
                                        image: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&q=80&w=600'
                                    },
                                    {
                                        id: 7,
                                        title: '24/7 Security',
                                        description: 'Round-the-clock security and in-room safe deposit boxes.',
                                        icon: <ShieldCheck className="h-[16px] w-[16px] text-white" />,
                                        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&q=80&w=600'
                                    },
                                ]}
                                baseWidth={450}
                                autoplay={true}
                                autoplayDelay={3000}
                                pauseOnHover={true}
                                loop={true}
                                round={false}
                            />
                        </div>
                    </section>

                    {/* Reviews Section */}
                    <section ref={reviewsRef} className="mt-16 bg-white rounded-[40px] p-10 shadow-sm border border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                            <h2 className="text-2xl font-bold text-gray-900">What Guests Say</h2>
                            <button className="text-blue-600 font-bold hover:underline flex items-center gap-1">Read all {hotel.reviews?.length || 120} reviews <ChevronRight size={16} /></button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="text-center md:border-r border-gray-100 last:border-0 md:pr-10">
                                <div className="text-6xl font-black text-gray-900 mb-2">4.2</div>
                                <div className="flex justify-center gap-1 mb-2">
                                    {[1, 2, 3, 4].map(i => <Star key={i} size={18} className="fill-orange-400 text-orange-400" />)}
                                    <Star size={18} className="text-gray-200 fill-gray-200" />
                                </div>
                                <p className="text-gray-500 font-medium">Based on 120 verified check-ins</p>
                            </div>
                            <div className="md:col-span-2 space-y-4">
                                {[
                                    { label: 'Cleanliness', score: 90 },
                                    { label: 'Location', score: 95 },
                                    { label: 'Service', score: 85 },
                                    { label: 'Value for Money', score: 80 },
                                ].map((stat, idx) => (
                                    <div key={idx}>
                                        <div className="flex justify-between text-sm font-bold text-gray-700 mb-1.5">
                                            <span>{stat.label}</span>
                                            <span>{stat.score / 10} / 10</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                whileInView={{ width: `${stat.score}%` }}
                                                className="h-full bg-green-500 rounded-full"
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Right Sidebar - Summary Card */}
                <div className="sticky top-24 space-y-6">
                    <div className="bg-white rounded-[32px] overflow-hidden shadow-2xl border border-gray-100">
                        <div className="p-6 bg-gray-900 text-white">
                            <h3 className="text-lg font-bold">Booking Summary</h3>
                            <p className="text-gray-400 text-xs">Instantly book with confidence</p>
                        </div>
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 text-blue-600 p-2 rounded-xl">
                                        <Users size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Guests</p>
                                        <p className="text-sm font-bold text-gray-900">2 Adults, 1 Child</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-300" />
                            </div>

                            <div className="flex justify-between items-center mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="bg-green-50 text-green-600 p-2 rounded-xl">
                                        <Clock size={20} />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-bold uppercase">Stay</p>
                                        <p className="text-sm font-bold text-gray-900">{totalNights} Night{totalNights > 1 ? 's' : ''}</p>
                                    </div>
                                </div>
                                <ChevronRight size={16} className="text-gray-300" />
                            </div>

                            <div className="space-y-4 mb-8">
                                <div>
                                    <label className="text-xs text-gray-500 font-bold uppercase mb-2 flex items-center gap-2">
                                        <CalendarDays size={14} /> Check-in Date
                                    </label>
                                    <input
                                        type="date"
                                        value={checkInDate}
                                        min={new Date().toISOString().split('T')[0]}
                                        onChange={(e) => setCheckInDate(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">{selectedDateLabel}</p>
                                </div>

                                <div>
                                    <label className="text-xs text-gray-500 font-bold uppercase mb-2 flex items-center gap-2">
                                        <Moon size={14} /> Nights / Days
                                    </label>
                                    <input
                                        type="number"
                                        min={1}
                                        max={30}
                                        value={totalNights}
                                        onChange={(e) => setStayNights(e.target.value)}
                                        className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">{totalNights} night{totalNights > 1 ? 's' : ''} / {totalNights + 1} day{totalNights > 0 ? 's' : ''}</p>
                                </div>
                            </div>

                            <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 mb-6">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Selected Room</p>
                                <p className="text-sm font-bold text-gray-900">{selectedRoom?.type || 'Room'}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatINR(selectedRoomNightly)} + {formatINR(selectedRoomTaxes)} taxes per night</p>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <div className="flex justify-between items-baseline mb-1">
                                    <span className="text-gray-500 font-medium">Total for {totalNights} night{totalNights > 1 ? 's' : ''}</span>
                                    <span className="text-2xl font-black text-gray-900">{formatINR(bookingTotal)}</span>
                                </div>
                                <p className="text-xs text-gray-400 text-right mb-6">Inclusive of VAT and local taxes</p>

                                <button
                                    onClick={handleReserveNow}
                                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-2 mb-4"
                                >
                                    Reserve Now <CreditCard size={20} />
                                </button>

                                <div className="flex items-center gap-2 text-green-600 justify-center text-xs font-bold bg-green-50 py-2 rounded-xl border border-green-100">
                                    <ShieldCheck size={14} /> Risk-Free! No cancellation fee
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HotelDetails;
