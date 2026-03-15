import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import {
  PlaneTakeoff,
  Clock3,
  Luggage,
  Utensils,
  ShieldCheck,
  Users,
  CalendarDays,
  ChevronRight,
  Crown,
} from "lucide-react";
import Navbar from "../../components/cinematic/Navbar";
import { getFlightById } from "../../services/flightService";
import { getOptimizedImageUrl } from "../../utils/media";
import { formatINR } from "../../utils/currency";

const classMultiplierMap = {
  economy: 1,
  premium: 1.35,
  deluxe: 1.65,
  business: 1.8,
  first: 2,
};

const getClassMultiplier = (value) => {
  const normalized = String(value || "").toLowerCase();
  return classMultiplierMap[normalized] || 1.25;
};

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

const FlightDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [flight, setFlight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState("Premium");
  const [selectedMeal, setSelectedMeal] = useState("Veg Meal");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const loadFlight = async () => {
      try {
        const data = await getFlightById(id);
        if (!isMounted) return;

        setFlight(data);

        const availableClasses = data?.cabinClasses?.length
          ? data.cabinClasses
          : ["Economy", "Premium", "Deluxe"];
        const defaultClass = availableClasses.includes("Premium")
          ? "Premium"
          : availableClasses[0];
        setSelectedClass(defaultClass);

        const availableMeals = data?.mealOptions?.length
          ? data.mealOptions
          : ["Veg Meal", "Non-Veg Meal", "Continental"];
        setSelectedMeal(availableMeals[0]);
      } catch (error) {
        console.error("Failed to load flight", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadFlight();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const classOptions = flight?.cabinClasses?.length
    ? flight.cabinClasses
    : ["Economy", "Premium", "Deluxe"];
  const mealOptions = flight?.mealOptions?.length
    ? flight.mealOptions
    : ["Veg Meal", "Non-Veg Meal", "Continental"];

  const pricing = useMemo(() => {
    const basePrice = Number(flight?.price || 0);
    const classMultiplier = getClassMultiplier(selectedClass);
    const adultFare = basePrice * classMultiplier;
    const childFare = adultFare * 0.6;
    const subtotal = adultFare * Number(adults || 1) + childFare * Number(children || 0);
    const taxes = Math.round(subtotal * 0.18);
    const total = Math.round(subtotal + taxes);

    return {
      baseFare: Math.round(subtotal),
      taxes,
      total,
    };
  }, [flight?.price, selectedClass, adults, children]);

  const handleContinue = () => {
    if (!flight) return;

    const payload = {
      flight: flight._id,
      travelClass: selectedClass,
      mealPlan: selectedMeal,
      luggage: flight.luggageAllowance || "25kg check-in + 7kg cabin",
      passengers: {
        adults: Number(adults || 1),
        children: Number(children || 0),
      },
      basePrice: pricing.baseFare,
      taxes: pricing.taxes,
      totalPrice: pricing.total,
    };

    navigate("/flight-payment", {
      state: {
        flightBookingData: payload,
        flightInfo: {
          id: flight._id,
          airline: flight.airline,
          origin: flight.origin,
          destination: flight.destination,
          departureTime: flight.departureTime,
          arrivalTime: flight.arrivalTime,
          duration: flight.duration,
          aircraft: flight.aircraft,
          image: flight.image,
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030816] text-white flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-[#8BE9FF]/40 border-t-[#8BE9FF] animate-spin" />
      </div>
    );
  }

  if (!flight) {
    return (
      <div className="min-h-screen bg-[#030816] text-white flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-xl font-bold">Flight not found</p>
          <button
            onClick={() => navigate("/flights")}
            className="mt-5 px-6 py-3 rounded-xl bg-[#8BE9FF] text-[#071126] font-bold"
          >
            Back to Flights
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#030816] text-white pb-16">
      <Navbar />

      <div className="pt-28 px-6 md:px-10 max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-8">
        <motion.section
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="rounded-[32px] border border-white/10 bg-white/5 overflow-hidden"
        >
          <div className="relative h-[260px] md:h-[340px]">
            <img
              src={getOptimizedImageUrl(flight.image, { width: 1400 })}
              alt={flight.airline}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030816] via-[#030816]/40 to-transparent" />
            <div className="absolute left-6 bottom-6">
              <p className="text-xs uppercase tracking-[0.22em] text-[#8BE9FF]">Flight Section</p>
              <h1 className="text-3xl md:text-4xl font-black mt-2">{flight.airline}</h1>
              <p className="text-sm text-white/70 mt-1">{flight.origin} to {flight.destination}</p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">From</p>
                <p className="mt-1 text-lg font-bold">{flight.origin}</p>
                <p className="mt-2 text-sm text-white/65">{formatFlightDateTime(flight.departureTime)}</p>
              </div>
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">To</p>
                <p className="mt-1 text-lg font-bold">{flight.destination}</p>
                <p className="mt-2 text-sm text-white/65">{formatFlightDateTime(flight.arrivalTime)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4 flex items-center gap-3">
                <Clock3 size={18} className="text-[#8BE9FF]" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Time</p>
                  <p className="text-sm font-bold">{flight.duration || "Schedule TBA"}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4 flex items-center gap-3">
                <Luggage size={18} className="text-[#8BE9FF]" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Luggage</p>
                  <p className="text-sm font-bold">{flight.luggageAllowance || "25kg + 7kg"}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4 flex items-center gap-3">
                <PlaneTakeoff size={18} className="text-[#8BE9FF]" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Aircraft</p>
                  <p className="text-sm font-bold">{flight.aircraft || "Fleet assigned"}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#8BE9FF]/7 border border-[#8BE9FF]/25 p-5">
              <div className="flex items-center gap-2 text-[#8BE9FF] mb-3">
                <Crown size={16} />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Class Options</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {classOptions.map((travelClass) => {
                  const isActive = selectedClass === travelClass;
                  return (
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      key={travelClass}
                      type="button"
                      onClick={() => setSelectedClass(travelClass)}
                      className={`rounded-xl px-4 py-3 text-sm font-bold transition-all border ${
                        isActive
                          ? "bg-[#8BE9FF] text-[#071126] border-[#8BE9FF]"
                          : "bg-black/35 border-white/12 text-white hover:border-[#8BE9FF]/45"
                      }`}
                    >
                      {travelClass}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-black/35 border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Utensils size={16} className="text-[#8BE9FF]" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Food Preference</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {mealOptions.map((meal) => {
                  const active = selectedMeal === meal;
                  return (
                    <button
                      key={meal}
                      type="button"
                      onClick={() => setSelectedMeal(meal)}
                      className={`px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                        active
                          ? "bg-white text-[#071126] border-white"
                          : "bg-transparent text-white/75 border-white/20 hover:border-white/40"
                      }`}
                    >
                      {meal}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut", delay: 0.05 }}
          className="rounded-[32px] border border-white/10 bg-white/5 p-6 md:p-8 h-fit sticky top-24"
        >
          <h2 className="text-sm font-black uppercase tracking-[0.24em] text-white/55">Trip Summary</h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-black/35 border border-white/10 p-4">
              <p className="text-xs text-white/45 uppercase tracking-[0.18em]">Route</p>
              <p className="text-base font-bold mt-1">{flight.origin} to {flight.destination}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-bold">Adults</label>
                <input
                  type="number"
                  min={1}
                  max={9}
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value) || 1)}
                  className="mt-2 w-full rounded-xl bg-black/35 border border-white/10 px-3 py-3 text-sm font-bold focus:outline-none focus:border-[#8BE9FF]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-bold">Children</label>
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value) || 0)}
                  className="mt-2 w-full rounded-xl bg-black/35 border border-white/10 px-3 py-3 text-sm font-bold focus:outline-none focus:border-[#8BE9FF]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/35 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-white/75">
                <span>Class</span>
                <span>{selectedClass}</span>
              </div>
              <div className="flex justify-between text-white/75">
                <span>Meal</span>
                <span>{selectedMeal}</span>
              </div>
              <div className="flex justify-between text-white/75">
                <span>Fare</span>
                <span>{formatINR(pricing.baseFare)}</span>
              </div>
              <div className="flex justify-between text-white/75">
                <span>Taxes</span>
                <span>{formatINR(pricing.taxes)}</span>
              </div>
              <div className="pt-3 mt-3 border-t border-white/10 flex justify-between items-end">
                <span className="text-[11px] uppercase tracking-[0.18em] text-white/45 font-black">Payable</span>
                <span className="text-3xl font-black text-[#8BE9FF]">{formatINR(pricing.total)}</span>
              </div>
            </div>

            <button
              onClick={handleContinue}
              className="w-full mt-3 rounded-2xl bg-[#8BE9FF] text-[#071126] py-4 font-black uppercase tracking-[0.16em] hover:bg-[#79e2fb] transition-colors flex items-center justify-center gap-2"
            >
              Continue To Payment <ChevronRight size={18} />
            </button>

            <div className="text-xs text-green-300/90 flex items-center justify-center gap-2 bg-green-500/10 border border-green-400/20 rounded-xl py-3">
              <ShieldCheck size={14} /> Instant confirmation after payment
            </div>

            <div className="text-[11px] text-white/50 flex items-center justify-center gap-2">
              <CalendarDays size={12} />
              Travel date follows your selected flight schedule
            </div>

            <button
              type="button"
              onClick={() => navigate("/flights")}
              className="w-full text-[10px] uppercase tracking-[0.2em] font-bold text-white/45 hover:text-white/75 transition-colors"
            >
              Back to flight list
            </button>
          </div>
        </motion.aside>
      </div>
    </div>
  );
};

export default FlightDetails;
