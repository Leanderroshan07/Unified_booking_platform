import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { createTrainBooking } from "../../services/trainBookingService";
import { formatINR } from "../../utils/currency";
import { getOptimizedImageUrl } from "../../utils/media";
import fallbackTrainImage from "../../assets/train.jpg";

const formatTrainDateTime = (value) => {
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

const TrainPayment = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const trainBookingData = location.state?.trainBookingData;
  const trainInfo = location.state?.trainInfo || {};

  useEffect(() => {
    if (!trainBookingData) {
      const timer = setTimeout(() => navigate("/trains"), 1500);
      return () => clearTimeout(timer);
    }

    return undefined;
  }, [trainBookingData, navigate]);

  const passengerSummary = useMemo(() => {
    const adults = Number(trainBookingData?.passengers?.adults || 1);
    const children = Number(trainBookingData?.passengers?.children || 0);
    return `${adults} Adult(s), ${children} Child(ren)`;
  }, [trainBookingData]);

  const trainImage = trainInfo.image
    ? getOptimizedImageUrl(trainInfo.image, { width: 1400 })
    : fallbackTrainImage;

  const handleConfirmPayment = async () => {
    if (!trainBookingData) {
      return;
    }

    try {
      setLoading(true);
      setError("");
      const booking = await createTrainBooking(trainBookingData);
      navigate("/train-booking-success", {
        state: {
          booking,
          trainInfo,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!trainBookingData) {
    return (
      <div className="min-h-screen bg-[#040a0f] text-white flex items-center justify-center">
        <p>No train booking found. Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040a0f] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white/5 border border-white/10 rounded-3xl overflow-hidden">
        <div className="p-8 bg-black/35 border-r border-white/10">
          <div className="mb-6 -mt-1 -mx-1 rounded-2xl overflow-hidden border border-white/10">
            <img
              src={trainImage}
              alt={trainInfo.operator || "Train"}
              className="w-full h-44 object-cover"
              loading="lazy"
              decoding="async"
            />
          </div>

          <h2 className="text-xs font-black uppercase tracking-[0.25em] text-neutral-500 mb-8">
            Train Summary
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-white">{trainInfo.operator || "Train Booking"}</h3>
              <p className="text-sm text-neutral-400 mt-1">
                {trainInfo.origin || "Origin"} to {trainInfo.destination || "Destination"}
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Departure</span>
                <span className="font-semibold text-neutral-200">{formatTrainDateTime(trainInfo.departureTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Arrival</span>
                <span className="font-semibold text-neutral-200">{formatTrainDateTime(trainInfo.arrivalTime)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Train Type</span>
                <span className="font-semibold text-neutral-200">{trainInfo.trainType || "Express"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Travel Class</span>
                <span className="font-semibold text-neutral-200">{trainBookingData.travelClass}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500">Passengers</span>
                <span className="font-semibold text-neutral-200">{passengerSummary}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Base Fare</span>
                <span>{formatINR(trainBookingData.basePrice || 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-400">
                <span>Taxes</span>
                <span>{formatINR(trainBookingData.taxes || 0)}</span>
              </div>
              <div className="flex justify-between items-end pt-3">
                <span className="text-xs uppercase tracking-wider text-neutral-500 font-bold">Payable</span>
                <span className="text-3xl font-black text-white">{formatINR(trainBookingData.totalPrice || 0)}</span>
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
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#f8b84e]"
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
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#f8b84e]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">
                  CVV
                </label>
                <input
                  type="password"
                  defaultValue="123"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#f8b84e]"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
              onClick={handleConfirmPayment}
              disabled={loading}
              className="w-full mt-4 py-4 rounded-xl bg-[#f8b84e] text-[#1a1110] text-xs font-black uppercase tracking-[0.2em] hover:shadow-[0_0_25px_rgba(248,184,78,0.35)] transition-all disabled:opacity-50"
            >
              {loading ? "Processing..." : "Confirm & Book Train"}
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

export default TrainPayment;
