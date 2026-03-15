import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createHotelBooking } from "../../services/hotelBookingService";
import { formatINR } from "../../utils/currency";

const HotelPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hotelBookingData = location.state?.hotelBookingData;
  const hotelInfo = location.state?.hotelInfo || {};

  useEffect(() => {
    if (!hotelBookingData) {
      const timer = setTimeout(() => navigate("/hotels"), 1600);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [hotelBookingData, navigate]);

  const checkInLabel = useMemo(() => {
    if (!hotelBookingData?.checkInDate) return "";
    const parsed = new Date(`${hotelBookingData.checkInDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return hotelBookingData.checkInDate;
    return parsed.toLocaleDateString("en-IN", {
      weekday: "long",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, [hotelBookingData]);

  const handleConfirmPayment = async () => {
    if (!hotelBookingData) return;

    try {
      setLoading(true);
      setError("");
      const booking = await createHotelBooking(hotelBookingData);
      navigate("/hotel-booking-success", {
        state: {
          booking,
          hotelInfo,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!hotelBookingData) {
    return (
      <div className="min-h-screen bg-[#0a0b10] text-white flex items-center justify-center">
        <p>No hotel booking found. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b10] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-8 bg-black/35 border-r border-white/10">
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500 mb-8">
            Reservation Summary
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white">{hotelInfo.name || "Hotel Booking"}</h3>
              <p className="text-sm text-neutral-400 mt-1">{hotelInfo.location || "Your selected property"}</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Room</span>
                <span className="font-semibold text-neutral-200">{hotelBookingData.roomType}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Check-in</span>
                <span className="font-semibold text-neutral-200">{checkInLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Stay</span>
                <span className="font-semibold text-neutral-200">
                  {hotelBookingData.nights} night{hotelBookingData.nights > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Guests</span>
                <span className="font-semibold text-neutral-200">
                  {hotelBookingData.guests?.adults || 2} Adult(s), {hotelBookingData.guests?.children || 0} Child(ren)
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Room + Taxes per night</span>
                <span>
                  {formatINR((hotelBookingData.pricePerNight || 0) + (hotelBookingData.taxesPerNight || 0))}
                </span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Stay total</span>
                <span>{formatINR(hotelBookingData.totalPrice || 0)}</span>
              </div>
              <div className="flex justify-between items-end pt-3">
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold">Payable</span>
                <span className="text-3xl font-black text-white">{formatINR(hotelBookingData.totalPrice || 0)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-8">
          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500 mb-8">
            Secure Payment
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                Card Number
              </label>
              <input
                type="text"
                defaultValue="4242 4242 4242 4242"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-red"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  Expiry
                </label>
                <input
                  type="text"
                  defaultValue="12/28"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-red"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  CVV
                </label>
                <input
                  type="password"
                  defaultValue="123"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-red"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="w-full mt-4 py-4 rounded-xl bg-brand-red text-white text-xs font-black uppercase tracking-[0.2em] hover:shadow-[0_0_25px_rgba(255,59,59,0.35)] transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm & Reserve"}
            </button>

            <button
              onClick={() => navigate(-1)}
              className="w-full py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-colors"
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HotelPayment;
