import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
  TrainFront,
  Users,
} from "lucide-react";
import Navbar from "../../components/cinematic/Navbar";
import SpotlightCard from "../../components/SpotlightCard";
import { formatINR } from "../../utils/currency";
import { getTrains } from "../../services/trainService";
import trainBackgroundImage from "../../assets/train ww.jpg";
import fallbackTrainImage from "../../assets/train.jpg";

const fallbackTrains = [
  {
    _id: "sample-train-1",
    operator: "Aurora Express",
    origin: "Mumbai",
    destination: "Delhi",
    price: 2199,
    departureTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 18 * 60 * 60 * 1000).toISOString(),
    duration: "16h 00m",
    trainType: "Premium Sleeper",
    seatsAvailable: 46,
    amenities: ["2-Tier Berths", "Charging Ports", "Wi-Fi", "Onboard Meals"],
    description: "Long-haul premium rail comfort with spacious cabins and smooth overnight travel.",
    image: fallbackTrainImage,
    isFeatured: true,
  },
  {
    _id: "sample-train-2",
    operator: "MetroLuxe Rail",
    origin: "Bengaluru",
    destination: "Chennai",
    price: 1399,
    departureTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    duration: "06h 00m",
    trainType: "Executive Chair",
    seatsAvailable: 62,
    amenities: ["Recliner Chairs", "Pantry Service", "Reading Lights", "Live Tracking"],
    description: "Fast city-to-city route tailored for business and comfort-focused commuters.",
    image: fallbackTrainImage,
    isFeatured: false,
  },
  {
    _id: "sample-train-3",
    operator: "Saffron Vista Line",
    origin: "Jaipur",
    destination: "Ahmedabad",
    price: 1699,
    departureTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 14 * 60 * 60 * 1000).toISOString(),
    duration: "08h 00m",
    trainType: "Semi Luxury",
    seatsAvailable: 38,
    amenities: ["Wide Windows", "AC Coach", "Refreshments", "Family Seating"],
    description: "Scenic rail corridor offering comfort and on-time arrivals for weekend escapes.",
    image: fallbackTrainImage,
    isFeatured: false,
  },
];

const formatDateTime = (value) => {
  if (!value) return "TBA";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "TBA";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getDateKey = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const matchesQuery = (train, fromQuery, toQuery, dateQuery) => {
  const origin = String(train.origin || "").toLowerCase();
  const destination = String(train.destination || "").toLowerCase();
  const originMatch = !fromQuery || origin.includes(fromQuery);
  const destinationMatch = !toQuery || destination.includes(toQuery);
  const dateMatch = !dateQuery || getDateKey(train.departureTime) === dateQuery;
  return originMatch && destinationMatch && dateMatch;
};

const Trains = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [trains, setTrains] = useState([]);

  const fromQuery = searchParams.get("from")?.trim().toLowerCase() || "";
  const toQuery = searchParams.get("to")?.trim().toLowerCase() || "";
  const dateQuery = searchParams.get("date")?.trim() || "";

  useEffect(() => {
    let mounted = true;

    const loadTrains = async () => {
      try {
        const data = await getTrains();
        if (!mounted) return;

        if (Array.isArray(data) && data.length > 0) {
          setTrains(data);
          return;
        }

        setTrains(fallbackTrains);
      } catch (error) {
        console.error("Failed to load trains", error);
        if (mounted) {
          setTrains(fallbackTrains);
        }
      }
    };

    loadTrains();

    return () => {
      mounted = false;
    };
  }, []);

  const visibleTrains = useMemo(() => {
    const source = trains.length > 0 ? trains : fallbackTrains;
    const filtered = source.filter((train) =>
      matchesQuery(train, fromQuery, toQuery, dateQuery)
    );
    return filtered.length > 0 ? filtered : source;
  }, [dateQuery, fromQuery, toQuery, trains]);

  const featuredTrain = useMemo(
    () => visibleTrains.find((train) => train.isFeatured) || visibleTrains[0] || fallbackTrains[0],
    [visibleTrains]
  );

  const { scrollYProgress } = useScroll();
  const heroScale = useTransform(scrollYProgress, [0, 0.4], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.35], [0.85, 0.4]);

  return (
    <div className="min-h-screen bg-[#040a0f] text-white overflow-x-hidden selection:bg-[#f8b84e] selection:text-[#0a1018]">
      <Navbar />

      <style>
        {`
          @keyframes trainFadeIn {
            0% { opacity: 0.25; }
            100% { opacity: 1; }
          }

          @keyframes railGlow {
            0%, 100% { filter: drop-shadow(0 0 20px rgba(248, 184, 78, 0.18)); }
            50% { filter: drop-shadow(0 0 45px rgba(104, 226, 176, 0.35)); }
          }

          .train-fade {
            animation: trainFadeIn 1.1s ease-out;
          }

          .train-glow {
            animation: railGlow 3.2s ease-in-out infinite;
          }
        `}
      </style>

      <main className="relative pt-24 pb-20">
        <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 train-fade"
            style={{
              scale: heroScale,
              opacity: heroOpacity,
              backgroundImage: `url(${trainBackgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />

          <div className="absolute inset-0 bg-gradient-to-r from-[#040a0f]/80 via-[#040a0f]/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#040a0f]" />

          <div className="relative z-10 container mx-auto px-6 lg:px-12">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.35em] text-[#f8b84e] font-black mb-4">Rail Travel</p>
              <h1 className="text-5xl md:text-7xl font-black leading-[0.95] text-white">
                Journey <br /> in <br /> Style
              </h1>
              <p className="mt-6 text-base md:text-lg text-slate-300 leading-relaxed">
                Discover premium train routes across India — comfort, speed, and breathtaking scenery in every ride.
              </p>
            </div>
          </div>
        </section>

        <section className="relative container mx-auto px-6 lg:px-12 py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.35 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#f8b84e] font-black">Rail Routes</p>
              <h2 className="text-4xl md:text-5xl font-black mt-3">Luxury Train Corridors</h2>
              <p className="text-slate-400 text-base mt-3 max-w-2xl">
                Rail journeys inspired by the bus module experience, tuned with a warmer premium palette and curated route cards.
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 rounded-xl border border-white/20 text-sm font-bold text-white/90 hover:text-white hover:border-white/40 transition-colors whitespace-nowrap"
            >
              Back To Dashboard
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleTrains.map((train, index) => (
              <motion.div
                key={train._id}
                initial={{ opacity: 0, y: 26 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
              >
                <SpotlightCard
                  className="border-white/10 bg-[#0e1721]/75 p-0 h-full"
                  spotlightColor="rgba(248, 184, 78, 0.20)"
                >
                  <div className="relative">
                    <div className="aspect-[16/9] overflow-hidden rounded-t-3xl">
                      <img
                        src={train.image || featuredTrain?.image || fallbackTrainImage}
                        alt={train.operator}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#040a0f] via-[#040a0f]/15 to-transparent" />
                    </div>

                    {train.isFeatured && (
                      <div className="absolute top-4 right-4 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-[#f8b84e] text-[#1a1110]">
                        Featured
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-[#f8b84e] font-black">
                          {train.trainType || train.busType || "Premium Rail"}
                        </p>
                        <h3 className="text-xl font-black mt-1">{train.operator}</h3>
                      </div>
                      <span className="rounded-xl border border-[#f8b84e]/40 bg-[#f8b84e]/10 px-3 py-1 text-sm font-black text-[#ffe3b5]">
                        {formatINR(train.price || 0)}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm text-slate-300">
                      <p className="flex items-center gap-2">
                        <MapPin size={16} className="text-[#68e2b0]" />
                        {train.origin} to {train.destination}
                      </p>
                      <p className="flex items-center gap-2">
                        <Clock3 size={16} className="text-[#68e2b0]" />
                        {formatDateTime(train.departureTime)}
                      </p>
                      <p className="flex items-center gap-2">
                        <Users size={16} className="text-[#68e2b0]" />
                        {train.seatsAvailable ?? 0} seats available
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {(train.amenities || []).slice(0, 3).map((amenity) => (
                        <span
                          key={`${train._id}-${amenity}`}
                          className="text-[10px] px-2.5 py-1 rounded-full border border-white/15 bg-white/5 text-slate-300"
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <div className="pt-4 flex items-center justify-between border-t border-white/10">
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        <ShieldCheck size={14} className="text-[#68e2b0]" />
                        Verified
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/trains/${train._id}`, { state: { initialTrain: train } })}
                        className="inline-flex items-center gap-2 text-sm font-black text-[#f8b84e] hover:text-[#ffe3b5] transition-colors"
                      >
                        Book Now <ArrowRight size={15} />
                      </button>
                    </div>
                  </div>
                </SpotlightCard>
              </motion.div>
            ))}
          </div>

          {visibleTrains.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center mt-6">
              <TrainFront size={40} className="mx-auto text-[#f8b84e]" />
              <p className="mt-4 text-white font-bold text-xl">No trains available for this route</p>
              <p className="text-base text-slate-400 mt-2">Try adjusting your search criteria</p>
            </div>
          )}
        </section>

        <section className="relative container mx-auto px-6 lg:px-12 py-12">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="rounded-3xl border border-white/10 bg-gradient-to-r from-[#f8b84e]/10 via-white/5 to-[#68e2b0]/10 p-8 md:p-12"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#f8b84e] font-black">Why Choose Rail</p>
                <h3 className="text-3xl font-black mt-3">Balanced speed, comfort, and scenic travel</h3>
                <p className="text-slate-400 mt-4">
                  Enjoy curated intercity train journeys with premium amenities and transparent pricing.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[#68e2b0] font-bold text-sm uppercase tracking-[0.2em] whitespace-nowrap">
                <Sparkles size={18} /> Smooth Rail Experience
              </div>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default Trains;