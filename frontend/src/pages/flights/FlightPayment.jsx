import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createFlightBooking } from "../../services/flightBookingService";
import { formatINR } from "../../utils/currency";
import { getOptimizedImageUrl } from "../../utils/media";
import fallbackFlightImage from "../../assets/flight_model.jpg";

const formatFlightDateTime = (value) => {
  if (!value) return "TBA";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "TBA";

  return parsed.toLocaleString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  });
};

const FlightPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const flightBookingData = location.state?.flightBookingData;
  const flightInfo = location.state?.flightInfo || {};

  useEffect(() => {
    if (!flightBookingData) {
      const timer = setTimeout(() => navigate("/flights"), 1500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [flightBookingData, navigate]);

  const passengerSummary = useMemo(() => {
    const adults = Number(flightBookingData?.passengers?.adults || 1);
    const children = Number(flightBookingData?.passengers?.children || 0);
    return `${adults} Adult(s), ${children} Child(ren)`;
  }, [flightBookingData]);

  const flightImage = flightInfo.image
    ? getOptimizedImageUrl(flightInfo.image, { width: 1400 })
    : fallbackFlightImage;

  const handleConfirmPayment = async () => {
    if (!flightBookingData) return;

    try {
      setLoading(true);
      setError("");
      const booking = await createFlightBooking(flightBookingData);
      navigate("/flight-booking-success", {
        state: {
          booking,
          flightInfo,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!flightBookingData) {
    return (
      <div className="min-h-screen bg-[#0a0b10] text-white flex items-center justify-center">
        <p>No flight booking found. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0b10] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-8 bg-black/35 border-r border-white/10">
          <div className="mb-6 -mt-1 -mx-1 rounded-2xl overflow-hidden border border-white/10">
            <img
              src={flightImage}
              alt={flightInfo.airline || "Flight"}
              className="w-full h-44 object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>

          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500 mb-8">
            Flight Summary
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white">{flightInfo.airline || "Flight Booking"}</h3>
              <p className="text-sm text-neutral-400 mt-1">
                {flightInfo.origin || "Origin"} to {flightInfo.destination || "Destination"}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Departure</span>
                <span className="font-semibold text-neutral-200">{formatFlightDateTime(flightInfo.departureTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Arrival</span>
                <span className="font-semibold text-neutral-200">{formatFlightDateTime(flightInfo.arrivalTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Class</span>
                <span className="font-semibold text-neutral-200">{flightBookingData.travelClass}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Luggage</span>
                <span className="font-semibold text-neutral-200">{flightBookingData.luggage}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Meal</span>
                <span className="font-semibold text-neutral-200">{flightBookingData.mealPlan}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Passengers</span>
                <span className="font-semibold text-neutral-200">{passengerSummary}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Base Fare</span>
                <span>{formatINR(flightBookingData.basePrice || 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Taxes</span>
                <span>{formatINR(flightBookingData.taxes || 0)}</span>
              </div>
              <div className="flex justify-between items-end pt-3">
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold">Payable</span>
                <span className="text-3xl font-black text-white">{formatINR(flightBookingData.totalPrice || 0)}</span>
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
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#8BE9FF]"
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
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#8BE9FF]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  CVV
                </label>
                <input
                  type="password"
                  defaultValue="123"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#8BE9FF]"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="w-full mt-4 py-4 rounded-xl bg-[#8BE9FF] text-[#071126] text-xs font-black uppercase tracking-[0.2em] hover:shadow-[0_0_25px_rgba(139,233,255,0.35)] transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm & Book Flight"}
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

export default FlightPayment;
