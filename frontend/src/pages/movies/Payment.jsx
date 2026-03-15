import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createBooking } from '../../services/bookingService';

const Payment = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingData } = location.state || {};
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!bookingData) {
        return (
            <div className="h-screen bg-[#0a0b10] flex items-center justify-center text-white">
                <p>No booking data found. Redirecting...</p>
                {setTimeout(() => navigate('/dashboard'), 2000)}
            </div>
        );
    }

    const handlePayment = async () => {
        setLoading(true);
        setError(null);
        try {
            await createBooking(bookingData);
            // Success! Move to ticket step
            navigate('/dashboard'); // For now, until Ticket page is ready
            alert("Payment Successful! Booking Confirmed.");
        } catch (err) {
            setError(err.response?.data?.message || "Payment failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0b10] text-white font-sans flex items-center justify-center p-6">
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">

                {/* Order Summary */}
                <div className="p-10 bg-black/40 border-r border-white/5">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 mb-8">Order Summary</h2>

                    <div className="flex flex-col gap-6">
                        <div className="flex gap-4">
                            <div className="w-20 h-28 bg-neutral-800 rounded-lg overflow-hidden shrink-0 border border-white/10">
                                {/* Movie Poster Image would go here if passed in state */}
                            </div>
                            <div className="flex flex-col justify-center">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent">
                                    Confirmation Details
                                </h3>
                                <p className="text-sm text-neutral-400 mt-1">{bookingData.date} • {bookingData.time}</p>
                                <p className="text-xs text-brand-red font-bold uppercase mt-2">IMAX 3D</p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 py-6 border-y border-white/5">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-500">Tickets ({bookingData.seats.length})</span>
                                <span className="font-bold text-neutral-300">
                                    {bookingData.seats.map(s => `${s.row}${s.number}`).join(', ')}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-500">Service Fee</span>
                                <span className="font-bold text-neutral-300">$2.50</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-end pt-4">
                            <span className="text-xs font-bold text-neutral-500 uppercase">Total Amount</span>
                            <span className="text-4xl font-black text-white">${bookingData.totalPrice + 2.50}</span>
                        </div>
                    </div>
                </div>

                {/* Payment Logic */}
                <div className="p-10 flex flex-col justify-center">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500 mb-8">Secure Payment</h2>

                    <div className="flex flex-col gap-4">
                        <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Card Details</label>
                        <div className="p-4 bg-black/40 border border-white/10 rounded-xl flex items-center gap-4 group focus-within:border-brand-red transition-all">
                            <div className="w-10 h-6 bg-neutral-800 rounded flex items-center justify-center text-[10px] text-white font-bold italic">VISA</div>
                            <input
                                type="text"
                                placeholder="**** **** **** 1234"
                                className="bg-transparent border-none outline-none text-white text-sm w-full"
                                defaultValue="4242 4242 4242 4242"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">Expiry</label>
                                <input
                                    type="text"
                                    placeholder="MM/YY"
                                    className="p-4 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-brand-red whitespace-pre transition-all"
                                    defaultValue="12/28"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">CVV</label>
                                <input
                                    type="password"
                                    placeholder="***"
                                    className="p-4 bg-black/40 border border-white/10 rounded-xl text-white text-sm outline-none focus:border-brand-red transition-all"
                                    defaultValue="123"
                                />
                            </div>
                        </div>

                        {error && <p className="text-xs text-red-500 mt-2">{error}</p>}

                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="mt-8 w-full py-4 bg-brand-red text-white text-xs font-black uppercase tracking-[0.3em] rounded-xl hover:shadow-[0_0_30px_rgba(255,59,59,0.3)] transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                <>Pay Now <span className="opacity-40">→</span></>
                            )}
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className="w-full py-4 text-neutral-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
                        >
                            Back to selection
                        </button>
                    </div>

                    <p className="mt-10 text-[10px] text-neutral-600 text-center leading-relaxed italic">
                        Your payment is secure. We use industry-standard encryption to protect your data.
                    </p>
                </div>

            </div>
        </div>
    );
};

export default Payment;
