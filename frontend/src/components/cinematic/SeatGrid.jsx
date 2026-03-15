import React from 'react';

const SeatGrid = ({ seats, selectedSeats, onSeatClick }) => {
    return (
        <div className="flex flex-col items-center gap-8 p-8">
            {/* Cinema Screen */}
            <div className="w-full max-w-2xl h-12 bg-gradient-to-b from-brand-red/20 to-transparent rounded-[50%] blur-sm mb-8 relative">
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold tracking-[0.5em] text-brand-red/60 uppercase">
                    Screen
                </div>
            </div>

            {/* Seat Grid */}
            <div className="grid grid-cols-12 gap-3">
                {seats.map((seat) => {
                    const isSelected = selectedSeats.some(s => s.id === seat.id);
                    const isBooked = seat.status === 'booked';

                    return (
                        <button
                            key={seat.id}
                            disabled={isBooked}
                            onClick={() => onSeatClick(seat)}
                            className={`
                w-8 h-8 rounded-md text-[10px] font-medium transition-all duration-300
                flex items-center justify-center
                ${isBooked
                                    ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                                    : isSelected
                                        ? 'bg-brand-red text-white shadow-[0_0_15px_rgba(255,59,59,0.6)] scale-110'
                                        : 'bg-neutral-700 text-neutral-400 hover:bg-neutral-600 hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]'
                                }
              `}
                            title={`${seat.row}${seat.number} - $${seat.price}`}
                        >
                            {seat.number}
                        </button>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex gap-6 mt-8 text-xs font-medium text-neutral-400">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-neutral-700"></div>
                    <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-brand-red"></div>
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded bg-neutral-800"></div>
                    <span>Booked</span>
                </div>
            </div>
        </div>
    );
};

export default SeatGrid;
