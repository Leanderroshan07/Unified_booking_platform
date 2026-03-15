import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrainFront,
  Users,
} from "lucide-react";
import Navbar from "../../components/cinematic/Navbar";
import { getTrainById } from "../../services/trainService";
import { formatINR } from "../../utils/currency";
import { getOptimizedImageUrl } from "../../utils/media";
import fallbackTrainImage from "../../assets/train.jpg";

const classMultiplierMap = {
  Sleeper: 1,
  "3A": 1.18,
  "2A": 1.42,
};

const classOptions = [
  {
    value: "Sleeper",
    subtitle: "Best value",
    description: "Standard sleeper berths with basic amenities for overnight journeys.",
  },
  {
    value: "3A",
    subtitle: "Most popular",
    description: "Air-conditioned 3-tier berths with comfortable bedding and privacy curtains.",
  },
  {
    value: "2A",
    subtitle: "Premium comfort",
    description: "Spacious 2-tier AC berths with extra privacy and table service.",
  },
];

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

const TrainDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const initialTrain = location.state?.initialTrain || null;

  const [train, setTrain] = useState(initialTrain);
  const [loading, setLoading] = useState(!initialTrain);
  const [selectedClass, setSelectedClass] = useState("3A");
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTrain = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        const data = await getTrainById(id);
        if (!isMounted) return;

        setTrain(data);
        setLoadError("");
      } catch (error) {
        if (!isMounted) return;

        if (!initialTrain) {
          setTrain(null);
          setLoadError(error?.response?.data?.message || "Unable to load this train right now.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTrain();

    return () => {
      isMounted = false;
    };
  }, [id, initialTrain]);

  const isSampleTrain = String(train?._id || "").startsWith("sample-");
  const totalPassengers = Number(adults || 1) + Number(children || 0);
  const seatsAvailable = Number(train?.seatsAvailable || 0);
  const insufficientSeats = totalPassengers > seatsAvailable;

  const pricing = useMemo(() => {
    const basePrice = Number(train?.price || 0);
    const classMultiplier = classMultiplierMap[selectedClass] || 1;
    const adultFare = basePrice * classMultiplier;
    const childFare = adultFare * 0.65;
    const subtotal = adultFare * Number(adults || 1) + childFare * Number(children || 0);
    const taxes = Math.round(subtotal * 0.05);
    const total = Math.round(subtotal + taxes);

    return {
      baseFare: Math.round(subtotal),
      taxes,
      total,
    };
  }, [adults, train?.price, children, selectedClass]);

  const handleContinue = () => {
    if (!train || isSampleTrain || insufficientSeats) {
      return;
    }

    navigate("/train-payment", {
      state: {
        trainBookingData: {
          train: train._id,
          travelClass: selectedClass,
          passengers: {
            adults: Number(adults || 1),
            children: Number(children || 0),
          },
          basePrice: pricing.baseFare,
          taxes: pricing.taxes,
          totalPrice: pricing.total,
        },
        trainInfo: {
          id: train._id,
          operator: train.operator,
          origin: train.origin,
          destination: train.destination,
          departureTime: train.departureTime,
          arrivalTime: train.arrivalTime,
          duration: train.duration,
          trainType: train.trainType,
          image: train.image,
          amenities: train.amenities || [],
        },
      },
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#040a0f] text-white flex items-center justify-center">
        <div className="h-12 w-12 rounded-full border-2 border-[#f8b84e]/40 border-t-[#f8b84e] animate-spin" />
      </div>
    );
  }

  if (!train) {
    return (
      <div className="min-h-screen bg-[#040a0f] text-white flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-xl font-bold">Train not found</p>
          {loadError && <p className="text-sm text-white/55 mt-3">{loadError}</p>}
          <button
            onClick={() => navigate("/trains")}
            className="mt-5 px-6 py-3 rounded-xl bg-[#f8b84e] text-[#1a1110] font-bold"
          >
            Back to Trains
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#040a0f] text-white pb-16">
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
              src={getOptimizedImageUrl(train.image, { width: 1400 }) || fallbackTrainImage}
              alt={train.operator}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#040a0f] via-[#040a0f]/40 to-transparent" />
            <div className="absolute left-6 bottom-6">
              <p className="text-xs uppercase tracking-[0.22em] text-[#f8b84e]">Train Section</p>
              <h1 className="text-3xl md:text-4xl font-black mt-2">{train.operator}</h1>
              <p className="text-sm text-white/70 mt-1">{train.origin} to {train.destination}</p>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">From</p>
                <p className="mt-1 text-lg font-bold">{train.origin}</p>
                <p className="mt-2 text-sm text-white/65">{formatTrainDateTime(train.departureTime)}</p>
              </div>
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">To</p>
                <p className="mt-1 text-lg font-bold">{train.destination}</p>
                <p className="mt-2 text-sm text-white/65">{formatTrainDateTime(train.arrivalTime)}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4 flex items-center gap-3">
                <Clock3 size={18} className="text-[#f8b84e]" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Duration</p>
                  <p className="text-sm font-bold">{train.duration || "Schedule TBA"}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4 flex items-center gap-3">
                <TrainFront size={18} className="text-[#f8b84e]" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Train Type</p>
                  <p className="text-sm font-bold">{train.trainType || "Express"}</p>
                </div>
              </div>
              <div className="rounded-2xl bg-black/35 border border-white/10 p-4 flex items-center gap-3">
                <Users size={18} className="text-[#f8b84e]" />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-white/45">Seats Left</p>
                  <p className="text-sm font-bold">{seatsAvailable} seats available</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-[#f8b84e]/7 border border-[#f8b84e]/25 p-5">
              <div className="flex items-center gap-2 text-[#f8b84e] mb-3">
                <Sparkles size={16} />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Travel Class</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {classOptions.map((option) => {
                  const isActive = selectedClass === option.value;
                  return (
                    <motion.button
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedClass(option.value)}
                      className={`rounded-xl px-4 py-4 text-left transition-all border ${
                        isActive
                          ? "bg-[#f8b84e] text-[#1a1110] border-[#f8b84e]"
                          : "bg-black/35 border-white/12 text-white hover:border-[#f8b84e]/45"
                      }`}
                    >
                      <p className="text-sm font-black">{option.value}</p>
                      <p className={`text-[10px] uppercase tracking-[0.18em] mt-1 ${isActive ? "text-[#1a1110]/75" : "text-white/45"}`}>
                        {option.subtitle}
                      </p>
                      <p className={`text-xs mt-3 leading-relaxed ${isActive ? "text-[#1a1110]/85" : "text-white/70"}`}>
                        {option.description}
                      </p>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl bg-black/35 border border-white/10 p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck size={16} className="text-[#68e2b0]" />
                <p className="text-xs font-black uppercase tracking-[0.2em] text-white/70">Amenities Included</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {(train.amenities || []).map((amenity) => (
                  <span
                    key={`${train._id}-${amenity}`}
                    className="px-4 py-2 rounded-full text-xs font-bold border border-white/15 bg-white/5 text-white/75"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
              {train.description && <p className="text-sm text-white/55 mt-4 leading-relaxed">{train.description}</p>}
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
              <p className="text-base font-bold mt-1">{train.origin} to {train.destination}</p>
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
                  className="mt-2 w-full rounded-xl bg-black/35 border border-white/10 px-3 py-3 text-sm font-bold focus:outline-none focus:border-[#f8b84e]"
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
                  className="mt-2 w-full rounded-xl bg-black/35 border border-white/10 px-3 py-3 text-sm font-bold focus:outline-none focus:border-[#f8b84e]"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/35 p-4 space-y-2 text-sm">
              <div className="flex justify-between text-white/75">
                <span>Train Type</span>
                <span>{train.trainType || "Express"}</span>
              </div>
              <div className="flex justify-between text-white/75">
                <span>Travel Class</span>
                <span>{selectedClass}</span>
              </div>
              <div className="flex justify-between text-white/75">
                <span>Departure</span>
                <span>{formatTrainDateTime(train.departureTime)}</span>
              </div>
              <div className="flex justify-between text-white/75">
                <span>Passengers</span>
                <span>{totalPassengers}</span>
              </div>
            </div>

            <div className="rounded-2xl border border-[#f8b84e]/20 bg-[#f8b84e]/5 p-4 space-y-3">
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

            {isSampleTrain && (
              <div className="rounded-2xl border border-amber-400/25 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
                This is preview data. Add a real train in admin before placing a booking.
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
              disabled={isSampleTrain || insufficientSeats}
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f8b84e] px-5 py-4 text-sm font-black uppercase tracking-[0.18em] text-[#1a1110] transition hover:shadow-[0_0_25px_rgba(248,184,78,0.35)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue To Payment <ChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => navigate("/trains")}
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

export default TrainDetails;
