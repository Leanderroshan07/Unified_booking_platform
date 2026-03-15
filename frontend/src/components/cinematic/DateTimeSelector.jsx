import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

const DateTimeSelector = ({ onBuyTicket }) => {
    const [selectedDate, setSelectedDate] = useState(0);
    const [selectedTime, setSelectedTime] = useState(null);

    const dates = [
        { day: "MON", date: "16/02" },
        { day: "TUE", date: "17/02" },
        { day: "WED", date: "18/02" },
        { day: "THU", date: "19/02" },
        { day: "FRI", date: "20/02" },
        { day: "SAT", date: "21/02" },
        { day: "SUN", date: "22/02" },
    ];

    const times = ["15:00", "17:00", "19:00", "21:00"];

    return (
        <div className="bg-dark-bg/80 backdrop-blur-xl border-y border-white/5 py-8 sticky top-0 z-40">
            <div className="container mx-auto px-6 lg:px-12 flex flex-col lg:flex-row items-center justify-between gap-8">

                {/* Date Selection */}
                <div className="flex flex-col gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-wider">
                        <Calendar size={16} />
                        CHOOSE DATE
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="text-gray-500 hover:text-white transition-colors">
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex gap-4 overflow-x-auto no-scrollbar py-1">
                            {dates.map((d, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSelectedDate(i)}
                                    className={`flex flex-col items-center justify-center min-w-[70px] py-3 rounded-xl transition-all ${selectedDate === i
                                            ? "bg-brand-red text-white shadow-[0_5px_15px_rgba(255,42,42,0.3)]"
                                            : "bg-white/5 text-gray-400 hover:bg-white/10"
                                        }`}
                                >
                                    <span className="text-xs font-bold opacity-70">{d.date}</span>
                                    <span className="font-bold">{d.day}</span>
                                </button>
                            ))}
                        </div>
                        <button className="text-gray-500 hover:text-white transition-colors">
                            <ChevronRight size={24} />
                        </button>
                    </div>
                </div>

                {/* Time Selection */}
                <div className="flex flex-col gap-3 w-full lg:w-auto">
                    <div className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-wider">
                        <Clock size={16} />
                        CHOOSE TIME
                    </div>
                    <div className="flex gap-4">
                        {times.map((t) => (
                            <button
                                key={t}
                                onClick={() => setSelectedTime(t)}
                                className={`px-6 py-3 rounded-xl font-bold transition-all border ${selectedTime === t
                                        ? "border-brand-red text-brand-red bg-brand-red/10"
                                        : "border-white/10 text-gray-400 hover:border-white/30"
                                    }`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Action Button */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onBuyTicket}
                    className="bg-brand-red px-12 py-4 rounded-xl font-bold text-white shadow-[0_5px_20px_rgba(255,42,42,0.4)] hover:shadow-[0_8px_25px_rgba(255,42,42,0.6)] transition-all whitespace-nowrap"
                >
                    BUY TICKET
                </motion.button>
            </div>
        </div>
    );
};

export default DateTimeSelector;
