import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  Armchair,
  BusFront,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import Navbar from "../../components/cinematic/Navbar";
import { getBusById } from "../../services/busService";
import { formatINR } from "../../utils/currency";
import { getOptimizedImageUrl } from "../../utils/media";
import fallbackBusImage from "../../assets/bus.jpg";

const seatMultiplierMap = {
  Classic: 1,
  Comfort: 1.12,
  Elite: 1.28,
};

const seatOptions = [
  {
    value: "Classic",
    subtitle: "Great value",
    description: "Standard premium seating with verified operator support.",
  },
  {
    value: "Comfort",
    subtitle: "Most popular",
    description: "Extra legroom and priority boarding assistance at pickup.",
  },
  {
    value: "Elite",
    subtitle: "Maximum comfort",
    description: "Best seat placement with premium cabin comfort for long routes.",
  },
];

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

const BusDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialBus = location.state?.initialBus || null;

  const [bus, setBus] = useState(initialBus);
  const [loading, setLoading] = useState(!initialBus);
  const [selectedSeatPreference, setSelectedSeatPreference] = useState("Comfort");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadBus = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getBusById(id);
        if (!isMounted) return;

        setBus(data);
        setLoadError("");
      } catch (error) {
        if (!isMounted) return;

        if (!initialBus) {
          setBus(null);
          setLoadError(error?.response?.data?.message || "Unable to load this bus route right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadBus();

    return () => {
      isMounted = false;
    };
  }, [id, initialBus]);

  const isSampleBus = String(bus?._id || "").startsWith("sample-");
  const totalPassengers = Number(adults || 1) + Number(children || 0);
  const seatsAvailable = Number(bus?.seatsAvailable || 0);
  const insufficientSeats = totalPassengers > seatsAvailable;

  const pricing = useMemo(() => {
    const basePrice = Number(bus?.price || 0);
    const seatMultiplier = seatMultiplierMap[selectedSeatPreference] || 1;
    const adultFare = basePrice * seatMultiplier;
    const childFare = adultFare * 0.65;
    const subtotal = adultFare * Number(adults || 1) + childFare * Number(children || 0);
    const taxes = Math.round(subtotal * 0.05);
    const total = Math.round(subtotal + taxes);

    return {
      baseFare: Math.round(subtotal),
      taxes,
      total,
    };
  }, [adults, bus?.price, children, selectedSeatPreference]);

  const handleContinue = () => {
    if (!bus || isSampleBus || insufficientSeats) {
      return;
    }

    navigate("/bus-payment", {
      state: {
        busBookingData: {
          bus: bus._id,
          seatPreference: selectedSeatPreference,
          passengers: {
            adults: Number(adults || 1),
            children: Number(children || 0),
          },
          basePrice: pricing.baseFare,
          taxes: pricing.taxes,
          totalPrice: pricing.total,
        },
        busInfo: {
          id: bus._id,
          operator: bus.operator,
          origin: bus.origin,
          destination: bus.destination,
          departureTime: bus.departureTime,
          arrivalTime: bus.arrivalTime,
          duration: bus.duration,
          busType: bus.busType,
          image: bus.image,
          amenities: bus.amenities || [],
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

  if (!bus) {
    return (
      <div className="min-h-screen bg-[#030816] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-xl font-bold">Bus route not found</p>
          {loadError && <p className="text-sm text-white/55 mt-3">{loadError}</p>}
          <button
            onClick={() => navigate("/buses")}
            className="mt-5 px-6 py-3 rounded-xl bg-[#8BE9FF] text-[#071126] font-bold"
          >
            Back to Buses
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
              src={getOptimizedImageUrl(bus.image, { width: 1400 }) || fallbackBusImage}
              alt={bus.operator}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#030816] via-[#030816]/40 to-transparent" />
            <div className="absolute left-6 bottom-6">
              <p className="text-xs uppercase tracking-[0.22em] text-[#8BE9FF]">Bus Section</p>
              <h1 className="text-3xl md:text-4xl font-black mt-2">{bus.operator}</h1>
              <p className="text-sm text-white/70 mt-1">{bus.origin} to {bus.destination}</p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">From</p>
                <p className="mt-1 text-lg font-bold">{bus.origin}</p>
                <p className="mt-2 text-sm text-white/65">{formatBusDateTime(bus.departureTime)}</p>
              </div>
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">To</p>
                <p className="mt-1 text-lg font-bold">{bus.destination}</p>
                <p className="mt-2 text-sm text-white/65">{formatBusDateTime(bus.arrivalTime)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4 flex items-center gap-3">
                <Clock3 size={18} className="text-[#8BE9FF]" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Time</p>
                  <p className="text-sm font-bold">{bus.duration || "Schedule TBA"}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4 flex items-center gap-3">
                <BusFront size={18} className="text-[#8BE9FF]" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Coach</p>
                  <p className="text-sm font-bold">{bus.busType || "Luxury Coach"}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4 flex items-center gap-3">
                <Users size={18} className="text-[#8BE9FF]" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Seats Left</p>
                  <p className="text-sm font-bold">{seatsAvailable} seats available</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#8BE9FF]/7 border border-[#8BE9FF]/25 p-5">
              <div className="flex items-center gap-2 text-[#8BE9FF] mb-3">
                <Sparkles size={16} />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Seat Preference</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {seatOptions.map((option) => {
                  const isActive = selectedSeatPreference === option.value;
                  return (
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedSeatPreference(option.value)}
                      className={`rounded-xl px-4 py-4 text-left transition-all border ${
                        isActive
                          ? "bg-[#8BE9FF] text-[#071126] border-[#8BE9FF]"
                          : "bg-black/35 border-white/12 text-white hover:border-[#8BE9FF]/45"
                      }`}
                    >
                      <p className="text-sm font-black">{option.value}</p>
                      <p className={`text-[10px] uppercase tracking-[0.18em] mt-1 ${isActive ? "text-[#071126]/75" : "text-white/45"}`}>
                        {option.subtitle}
                      </p>
                      <p className={`text-xs mt-3 leading-relaxed ${isActive ? "text-[#071126]/85" : "text-white/70"}`}>
                        {option.description}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-black/35 border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-[#8BE9FF]" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Amenities Included</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(bus.amenities || []).map((amenity) => (
                  <span
                    key={`${bus._id}-${amenity}`}
                    className="px-4 py-2 rounded-full text-xs font-bold border border-white/15 bg-white/5 text-white/75"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
              {bus.description && <p className="text-sm text-white/55 mt-4 leading-relaxed">{bus.description}</p>}
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
              <p className="text-base font-bold mt-1">{bus.origin} to {bus.destination}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-bold">Adults</label>
                <input
                  type="number"
                  min={1}
                  max={Math.max(1, seatsAvailable)}
                  value={adults}
                  onChange={(event) => setAdults(Math.max(1, Number(event.target.value) || 1))}
                  className="mt-2 w-full rounded-xl bg-black/35 border border-white/10 px-3 py-3 text-sm font-bold focus:outline-none focus:border-[#8BE9FF]"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.18em] text-white/45 font-bold">Children</label>
                <input
                  type="number"
                  min={0}
                  max={Math.max(0, seatsAvailable - Number(adults || 1))}
                  value={children}
                  onChange={(event) => setChildren(Math.max(0, Number(event.target.value) || 0))}
                  className="mt-2 w-full rounded-xl bg-black/35 border border-white/10 px-3 py-3 text-sm font-bold focus:outline-none focus:border-[#8BE9FF]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/35 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-white/75">
                <span>Coach Type</span>
                <span>{bus.busType || "Luxury Coach"}</span>
              </div>
              <div className="flex justify-between text-white/75">
                <span>Seat Preference</span>
                <span>{selectedSeatPreference}</span>
              </div>
              <div className="flex justify-between text-white/75">
                <span>Travel Date</span>
                <span>{formatBusDateTime(bus.departureTime)}</span>
              </div>
              <div className="flex justify-between text-white/75">
                <span>Passengers</span>
                <span>{totalPassengers}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#8BE9FF]/20 bg-[#8BE9FF]/5 p-4 space-y-3">
              <div className="flex justify-between text-sm text-white/75">
                <span>Base fare</span>
                <span>{formatINR(pricing.baseFare)}</span>
              </div>
              <div className="flex justify-between text-sm text-white/75">
                <span>Taxes & fees</span>
                <span>{formatINR(pricing.taxes)}</span>
              </div>
              <div className="flex justify-between items-end pt-2 border-t border-white/10">
                <span className="text-xs uppercase tracking-[0.2em] text-white/45 font-black">Total</span>
                <span className="text-3xl font-black">{formatINR(pricing.total)}</span>
              </div>
            </div>

            {isSampleBus && (
              <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                This is preview data. Add a real bus route in admin before placing a booking.
              </div>
            )}

            {insufficientSeats && (
              <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                Selected passengers exceed the available seats for this route.
              </div>
            )}

            <button
              type="button"
              onClick={handleContinue}
              disabled={isSampleBus || insufficientSeats}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#8BE9FF] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#071126] transition hover:shadow-[0_0_25px_rgba(139,233,255,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue To Payment <ChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/buses")}
              className="w-full py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500 hover:text-white transition-colors"
            >
              Back To Routes
            </button>
          </div>
        </motion.aside>
      </div>
    </div>
  );
};

export default BusDetails;