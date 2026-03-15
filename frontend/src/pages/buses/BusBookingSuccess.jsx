import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { formatINR } from "../../utils/currency";

const formatBusDateTime = (value) => {
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

const BusBookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;
  const busInfo = location.state?.busInfo || {};

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#0a0b10] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p>Booking confirmation not found.</p>
          <button
            onClick={() => navigate("/buses")}
            className="px-6 py-3 rounded-xl bg-[#8BE9FF] text-[#071126] font-bold"
          >
            Back To Buses
          </button>
        </div>
      </div>
    );
  }

  const bookedBus = booking.bus || {};
  const passengerSummary = `${Number(booking.passengers?.adults || 1)} Adult(s), ${Number(booking.passengers?.children || 0)} Child(ren)`;

  return (
    <div className="min-h-screen bg-[#0a0b10] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
        <div className="flex items-center gap-3 text-green-400 mb-4">
          <CheckCircle2 size={30} />
          <h1 className="text-2xl md:text-3xl font-black">Bus Booking Confirmed</h1>
        </div>

        <p className="text-neutral-400 mb-8">
          Your bus ticket is confirmed. Keep this booking reference handy for support and boarding.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Operator</p>
            <p className="text-sm font-bold mt-1">{bookedBus.operator || busInfo.operator || "Operator"}</p>
            <p className="text-xs text-neutral-400 mt-1">
              {bookedBus.origin || busInfo.origin || "Origin"} to {bookedBus.destination || busInfo.destination || "Destination"}
            </p>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Booking Reference</p>
            <p className="text-sm font-bold mt-1">{booking.bookingReference || booking._id}</p>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Departure</p>
            <p className="text-sm font-bold mt-1">{formatBusDateTime(bookedBus.departureTime || busInfo.departureTime)}</p>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Seat Preference</p>
            <p className="text-sm font-bold mt-1">{booking.seatPreference}</p>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Passengers</p>
            <p className="text-sm font-bold mt-1">{passengerSummary}</p>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Total Paid</p>
            <p className="text-sm font-bold mt-1 text-green-400">{formatINR(booking.totalPrice)}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <button
            onClick={() => navigate("/buses")}
            className="flex-1 py-3 rounded-xl bg-[#8BE9FF] text-[#071126] font-bold"
          >
            Book Another Bus
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="flex-1 py-3 rounded-xl border border-white/20 text-neutral-300 font-bold hover:text-white hover:border-white/40 transition-colors"
          >
            Go To Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusBookingSuccess;