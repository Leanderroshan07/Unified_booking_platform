import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { formatINR } from "../../utils/currency";

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

const FlightBookingSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const booking = location.state?.booking;
  const flightInfo = location.state?.flightInfo || {};

  if (!booking) {
    return (
      <div className="min-h-screen bg-[#0a0b10] text-white flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p>Booking confirmation not found.</p>
          <button
            onClick={() => navigate("/flights")}
            className="px-6 py-3 rounded-xl bg-[#8BE9FF] text-[#071126] font-bold"
          >
            Back To Flights
          </button>
        </div>
      </div>
    );
  }

  const bookedFlight = booking.flight || {};

  return (
    <div className="min-h-screen bg-[#0a0b10] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-3xl rounded-3xl border border-white/10 bg-white/5 p-8 md:p-10">
        <div className="flex items-center gap-3 text-green-400 mb-4">
          <CheckCircle2 size={30} />
          <h1 className="text-2xl md:text-3xl font-black">Flight Booking Confirmed</h1>
        </div>

        <p className="text-neutral-400 mb-8">
          Your flight ticket is confirmed. Keep this booking ID for check-in support.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Airline</p>
            <p className="text-sm font-bold mt-1">{bookedFlight.airline || flightInfo.airline || "Airline"}</p>
            <p className="text-xs text-neutral-400 mt-1">
              {bookedFlight.origin || flightInfo.origin || "Origin"} to {bookedFlight.destination || flightInfo.destination || "Destination"}
            </p>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Booking ID</p>
            <p className="text-sm font-bold mt-1">{booking._id}</p>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Departure</p>
            <p className="text-sm font-bold mt-1">{formatFlightDateTime(bookedFlight.departureTime || flightInfo.departureTime)}</p>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Travel Class</p>
            <p className="text-sm font-bold mt-1">{booking.travelClass}</p>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Meal</p>
            <p className="text-sm font-bold mt-1">{booking.mealPlan}</p>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-wider text-neutral-500 font-bold">Total Paid</p>
            <p className="text-sm font-bold mt-1 text-green-400">{formatINR(booking.totalPrice)}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <button
            onClick={() => navigate("/flights")}
            className="flex-1 py-3 rounded-xl bg-[#8BE9FF] text-[#071126] font-bold"
          >
            Book Another Flight
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

export default FlightBookingSuccess;
