import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieById } from '../../services/movieService';
import { getBookedSeats, getInitialSeatLayout } from '../../services/bookingService';
import { LeftPanel, RightPanel } from '../../components/cinematic/BookingPanels';
import SeatGrid from '../../components/cinematic/SeatGrid';

const Booking = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [movie, setMovie] = useState(null);
    const [seats, setSeats] = useState([]);
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showDate, setShowDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [showTime, setShowTime] = useState("19:30");

    const dateOptions = useMemo(() => {
        const today = new Date();
        return Array.from({ length: 7 }, (_, index) => {
            const value = new Date(today);
            value.setDate(today.getDate() + index);
            return value.toISOString().split('T')[0];
        });
    }, []);

    const timeOptions = ["10:00", "13:30", "16:30", "19:30", "22:15"];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [movieRes, bookedRes] = await Promise.all([
                    getMovieById(id),
                    getBookedSeats(id, showDate, showTime)
                ]);

                setMovie(movieRes.data);

                // Initialize layout and mark booked seats
                const layout = getInitialSeatLayout();
                const bookedIds = bookedRes.data;
                const updatedLayout = layout.map(seat => ({
                    ...seat,
                    status: bookedIds.includes(seat.id) ? "booked" : "available"
                }));

                setSeats(updatedLayout);
                setSelectedSeats([]);
            } catch (error) {
                console.error("Error fetching booking data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, showDate, showTime]);

    const handleSeatClick = (seat) => {
        if (selectedSeats.some(s => s.id === seat.id)) {
            setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
        } else {
            setSelectedSeats([...selectedSeats, seat]);
        }
    };

    const handleNext = () => {
        const bookingData = {
            movie: id,
            seats: selectedSeats,
            totalPrice,
            date: showDate,
            time: showTime
        };
        navigate('/payment', { state: { bookingData } });
    };

    const totalPrice = selectedSeats.reduce((acc, seat) => acc + seat.price, 0);

    if (loading) return (
        <div className="h-screen w-full flex items-center justify-center bg-[#0a0b10] text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-brand-red border-t-transparent rounded-full animate-spin"></div>
                <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Initializing Cinema...</p>
            </div>
        </div>
    );

    if (!movie) return <div className="text-white p-10">Movie not found</div>;

    return (
        <div className="h-screen w-full bg-[#0a0b10] flex overflow-hidden font-sans">
            {/* Left Panel */}
            <div className="w-[300px] lg:w-[350px]">
                <LeftPanel
                    movie={movie}
                    selectedSeats={selectedSeats}
                    totalPrice={totalPrice}
                    selectedDate={showDate}
                    selectedTime={showTime}
                    onNext={handleNext}
                />
            </div>

            {/* Center Panel */}
            <div className="flex-grow flex flex-col overflow-y-auto pb-10 custom-scrollbar">
                {/* Progress Bar */}
                <div className="w-full max-w-xl mx-auto py-10 px-6">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-neutral-800 -z-10"></div>

                        <div className="flex flex-col items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-brand-red flex items-center justify-center text-[10px] font-bold text-white shadow-[0_0_15px_rgba(255,59,59,0.5)]">1</div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-red">Choose Place</span>
                        </div>

                        <div className="flex flex-col items-center gap-2 opacity-50">
                            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400">2</div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Payment</span>
                        </div>

                        <div className="flex flex-col items-center gap-2 opacity-50">
                            <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-400">3</div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Ticket</span>
                        </div>
                    </div>
                </div>

                {/* Seat Grid Area */}
                <div className="flex-grow flex items-center justify-center">
                    <SeatGrid
                        seats={seats}
                        selectedSeats={selectedSeats}
                        onSeatClick={handleSeatClick}
                    />
                </div>
            </div>

            {/* Right Panel */}
            <div className="w-[280px] hidden xl:block">
                <RightPanel
                    movie={movie}
                    selectedDate={showDate}
                    selectedTime={showTime}
                    dateOptions={dateOptions}
                    timeOptions={timeOptions}
                    onDateChange={setShowDate}
                    onTimeChange={setShowTime}
                />
            </div>
        </div>
    );
};

export default Booking;
