import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '../../utils/media';

const formatBookingDate = (value) => {
    if (!value) return 'Not selected';
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
    });
};

export const LeftPanel = ({ movie, selectedSeats, totalPrice, selectedDate, selectedTime, onNext }) => {
    const navigate = useNavigate();
    const posterUrl = getOptimizedImageUrl(movie.poster, { width: 720 });

    return (
        <div className="flex flex-col h-full gap-6 p-6 border-r border-white/5 bg-black/20 backdrop-blur-xl">
            <div className="relative group">
                <img
                    src={posterUrl}
                    alt={movie.title}
                    className="w-full rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-[1.02]"
                    loading="lazy"
                    decoding="async"
                />
                <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-white/10 group-hover:ring-white/20 transition-all"></div>
            </div>

            <div className="flex flex-col flex-grow gap-4 overflow-hidden">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500">Selected Seats</h3>
                <div className="flex flex-col gap-2 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedSeats.length === 0 ? (
                        <p className="text-sm text-neutral-600 italic">No seats selected yet</p>
                    ) : (
                        selectedSeats.map((seat) => (
                            <div
                                key={seat.id}
                                className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors"
                            >
                                <div className="flex flex-col">
                                    <span className="text-sm font-bold text-white">Row {seat.row}, Seat {seat.number}</span>
                                    <span className="text-[10px] text-neutral-500 uppercase">{seat.price > 12 ? 'Premium' : 'Standard'}</span>
                                </div>
                                <span className="text-sm font-bold text-brand-red">${seat.price}</span>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="mt-auto flex flex-col gap-4 pt-6 border-t border-white/5">
                <div className="rounded-xl bg-white/5 border border-white/5 p-3">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">Booking Summary</p>
                    <p className="text-xs font-semibold text-white mt-2">{formatBookingDate(selectedDate)} • {selectedTime}</p>
                </div>

                <div className="flex justify-between items-end">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">Total Price</span>
                    <span className="text-2xl font-black text-white">${totalPrice}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="px-4 py-3 rounded-xl border border-red-500/50 text-red-500 text-xs font-bold uppercase tracking-widest hover:bg-red-500/10 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        disabled={selectedSeats.length === 0}
                        onClick={onNext}
                        className="px-4 py-3 rounded-xl bg-gradient-to-tr from-brand-red to-[#ff5f5f] text-white text-xs font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(255,59,59,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        Reserve Ticket
                    </button>
                </div>
            </div>
        </div>
    );
};

export const RightPanel = ({ selectedDate, selectedTime, dateOptions = [], timeOptions = [], onDateChange, onTimeChange }) => {
    const parsed = selectedDate ? new Date(`${selectedDate}T00:00:00`) : null;
    const dateNumber = parsed && !Number.isNaN(parsed.getTime())
        ? parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
        : selectedDate || 'Date';
    const dateMeta = parsed && !Number.isNaN(parsed.getTime())
        ? parsed.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric' })
        : 'Choose show date';

    return (
        <div className="flex flex-col h-full gap-6 p-6 border-l border-white/5 bg-black/20 backdrop-blur-xl">
            <div className="flex flex-col gap-2 p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Selected Date</span>
                <span className="text-4xl font-black text-white">{dateNumber}</span>
                <span className="text-xs font-medium text-neutral-400">{dateMeta}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {dateOptions.map((dateValue) => {
                    const isActive = selectedDate === dateValue;
                    return (
                        <button
                            key={dateValue}
                            onClick={() => onDateChange?.(dateValue)}
                            className={`rounded-xl px-2 py-2 text-[10px] font-bold uppercase tracking-wider transition-colors ${isActive
                                    ? 'bg-brand-red text-white'
                                    : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                                }`}
                        >
                            {formatBookingDate(dateValue)}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 italic">Time</span>
                    <span className="text-lg font-bold text-white">{selectedTime || '19:30'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {timeOptions.map((timeValue) => {
                        const isActive = selectedTime === timeValue;
                        return (
                            <button
                                key={timeValue}
                                onClick={() => onTimeChange?.(timeValue)}
                                className={`rounded-xl px-2 py-2 text-[10px] font-bold tracking-wider transition-colors ${isActive
                                        ? 'bg-brand-red text-white'
                                        : 'bg-white/5 text-neutral-300 hover:bg-white/10'
                                    }`}
                            >
                                {timeValue}
                            </button>
                        );
                    })}
                </div>
                <div className="flex flex-col gap-1 p-4 rounded-xl bg-white/5 border border-white/5">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 italic">Format</span>
                    <span className="text-lg font-bold text-white">IMAX 3D</span>
                </div>
            </div>

            <div className="mt-auto p-4 rounded-xl bg-brand-red/5 border border-brand-red/10 border-dashed">
                <p className="text-[10px] leading-relaxed text-neutral-400 text-center">
                    * Please arrive 15 minutes before the show starts. Tickets are non-refundable 2 hours before the movie.
                </p>
            </div>
        </div>
    );
};
