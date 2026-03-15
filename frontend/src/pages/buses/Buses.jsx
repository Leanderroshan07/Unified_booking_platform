import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Armchair,
  ArrowRight,
  BusFront,
  Clock3,
  MapPin,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Navbar from "../../components/cinematic/Navbar";
import SpotlightCard from "../../components/SpotlightCard";
import { getBuses } from "../../services/busService";
import { formatINR } from "../../utils/currency";
import fallbackBusImage from "../../assets/bus.jpg";
import busBackgroundImage from "../../assets/bus ww.jpg";

const fallbackBuses = [
  {
    _id: "sample-bus-1",
    operator: "Aether Luxe Mobility",
    origin: "Mumbai",
    destination: "Goa",
    price: 2499,
    departureTime: new Date().toISOString(),
    arrivalTime: new Date(Date.now() + 10 * 60 * 60 * 1000).toISOString(),
    duration: "10h 00m",
    busType: "Luxury Sleeper",
    seatsAvailable: 18,
    amenities: ["Lie-flat Beds", "Wi-Fi", "Private Lighting", "Snacks"],
    description: "Premium overnight route with cinematic ambient cabin and extra legroom.",
    image: fallbackBusImage,
    isFeatured: true,
  },
  {
    _id: "sample-bus-2",
    operator: "Velvet Transit Elite",
    origin: "Bengaluru",
    destination: "Hyderabad",
    price: 1899,
    departureTime: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    arrivalTime: new Date(Date.now() + 11 * 60 * 60 * 1000).toISOString(),
    duration: "08h 00m",
    busType: "Executive Seater",
    seatsAvailable: 27,
    amenities: ["Panoramic Glass", "Charging Ports", "Water Bottle", "GPS Tracking"],
    description: "Modern highway coach designed for comfort and punctual arrivals.",
    image: fallbackBusImage,
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

const matchesQuery = (bus, fromQuery, toQuery, dateQuery) => {
  const origin = String(bus.origin || "").toLowerCase();
  const destination = String(bus.destination || "").toLowerCase();
  const originMatch = !fromQuery || origin.includes(fromQuery);
  const destinationMatch = !toQuery || destination.includes(toQuery);
  const dateMatch = !dateQuery || getDateKey(bus.departureTime) === dateQuery;
  return originMatch && destinationMatch && dateMatch;
};

const Buses = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [buses, setBuses] = useState([]);
  const [isHeroContentVisible, setIsHeroContentVisible] = useState(true);

  // Extract query params for filtering
  const fromQuery = searchParams.get("from")?.trim().toLowerCase() || "";
  const toQuery = searchParams.get("to")?.trim().toLowerCase() || "";
  const dateQuery = searchParams.get("date")?.trim() || "";

  useEffect(() => {
    let mounted = true;

    const loadBuses = async () => {
      try {
        const data = await getBuses();
        if (!mounted) return;

        if (Array.isArray(data) && data.length > 0) {
          setBuses(data);
          return;
        }

        setBuses(fallbackBuses);
      } catch (error) {
        console.error("Failed to load buses", error);
        if (mounted) {
          setBuses(fallbackBuses);
        }
      }
    };

    loadBuses();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsHeroContentVisible(false);
    }, 3200);

    return () => window.clearTimeout(timer);
  }, []);

  const visibleBuses = useMemo(() => {
    const filtered = buses.filter((bus) => matchesQuery(bus, fromQuery, toQuery, dateQuery));
    return filtered.length > 0 ? filtered : buses;
  }, [buses, dateQuery, fromQuery, toQuery]);

  const featuredBus = useMemo(() => {
    return visibleBuses.find((bus) => bus.isFeatured) || visibleBuses[0] || fallbackBuses[0];
  }, [visibleBuses]);

  return (
    <div className="min-h-screen bg-[#05070d] text-white overflow-x-hidden selection:bg-[#00e5ff] selection:text-[#031118]">
      <Navbar />

      <style>
        {`
          @keyframes floatBus {
            0%, 100% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-20px) scale(1.02); }
          }

          @keyframes glow {
            0%, 100% { filter: drop-shadow(0 0 20px rgba(0, 229, 255, 0.3)) drop-shadow(0 50px 120px rgba(0, 0, 0, 0.55)); }
            50% { filter: drop-shadow(0 0 40px rgba(0, 229, 255, 0.5)) drop-shadow(0 50px 120px rgba(0, 0, 0, 0.55)); }
          }

          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(100px); }
            to { opacity: 1; transform: translateX(0); }
          }

          .bus-imagecontainer {
            animation: slideInRight 0.8s ease-out, floatBus 4s ease-in-out infinite;
          }

          .bus-glow {
            animation: glow 3s ease-in-out infinite;
          }
        `}
      </style>

      <main className="relative pt-24 pb-20">
        {/* Hero Section with Background Image */}
        <section className="relative h-[600px] md:h-[700px] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${busBackgroundImage})`,
              opacity: 0.75,
            }}
          />

          {/* Overlay Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070d]/75 via-[#05070d]/35 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#05070d]" />

          {/* Hero Content */}
          <div className="relative z-10 container mx-auto px-6 lg:px-12">
            <div className="grid lg:grid-cols-[1fr_1fr] gap-20 items-center">
              {/* Left Content */}
              <div
                className={`max-w-3xl transition-all duration-1000 ease-out ${
                  isHeroContentVisible
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-10 pointer-events-none"
                }`}
              >
                <h1 className="text-5xl md:text-7xl font-black leading-[0.95] text-white">
                  Enjoy your <br /> Dream <br /> Vacation
                </h1>
                <p className="mt-6 text-base md:text-lg text-slate-300 leading-relaxed">
                  Book luxury bus, flights and stay packages at lowest price
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Available Routes Section */}
        <section className="relative container mx-auto px-6 lg:px-12 py-20">
          <div className="flex items-end justify-between gap-4 mb-12">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-[#6ad7ff] font-black">Available Routes</p>
              <h2 className="text-4xl md:text-5xl font-black mt-3">Luxury Bus Routes</h2>
              <p className="text-slate-400 text-base mt-3 max-w-2xl">
                Premium intercity routes curated for comfort-focused travel. Choose from our extensive network of luxury coaches.
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-3 rounded-xl border border-white/20 text-sm font-bold text-white/90 hover:text-white hover:border-white/40 transition-colors whitespace-nowrap"
            >
              Back To Dashboard
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {visibleBuses.map((bus) => (
              <SpotlightCard
                key={bus._id}
                className="border-white/10 bg-[#0b1222]/70 p-0 h-full"
                spotlightColor="rgba(0, 229, 255, 0.22)"
              >
                <div className="relative">
                  <div className="aspect-[16/9] overflow-hidden rounded-t-3xl">
                    <img
                      src={bus.image || featuredBus?.image || fallbackBusImage}
                      alt={bus.operator}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#05070d] via-[#05070d]/20 to-transparent" />
                  </div>

                  {bus.isFeatured && (
                    <div className="absolute top-4 right-4 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-[#00e5ff] text-[#04131d]">
                      Featured
                    </div>
                  )}
                </div>

                <div className="p-5 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.22em] text-[#6ad7ff] font-black">
                        {bus.busType || "Luxury Coach"}
                      </p>
                      <h3 className="text-xl font-black mt-1">{bus.operator}</h3>
                    </div>
                    <span className="rounded-xl border border-[#6ad7ff]/40 bg-[#6ad7ff]/10 px-3 py-1 text-sm font-black text-[#8ce8ff]">
                      {formatINR(bus.price || 0)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-300">
                    <p className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#6ad7ff]" />
                      {bus.origin} → {bus.destination}
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock3 size={16} className="text-[#6ad7ff]" />
                      {formatDateTime(bus.departureTime)}
                    </p>
                    <p className="flex items-center gap-2">
                      <Armchair size={16} className="text-[#6ad7ff]" />
                      {bus.seatsAvailable ?? 0} seats available
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(bus.amenities || []).slice(0, 3).map((amenity) => (
                      <span
                        key={`${bus._id}-${amenity}`}
                        className="text-[10px] px-2.5 py-1 rounded-full border border-white/15 bg-white/5 text-slate-300"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>

                  <div className="pt-4 flex items-center justify-between border-t border-white/10">
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400">
                      <ShieldCheck size={14} className="text-[#6ad7ff]" />
                      Verified
                    </div>
                    <button
                      type="button"
                      onClick={() => navigate(`/buses/${bus._id}`, { state: { initialBus: bus } })}
                      className="inline-flex items-center gap-2 text-sm font-black text-[#6ad7ff] hover:text-[#9ef0ff] transition-colors"
                    >
                      Book Now <ArrowRight size={15} />
                    </button>
                  </div>
                </div>
              </SpotlightCard>
            ))}
          </div>

          {visibleBuses.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/15 bg-white/5 p-12 text-center mt-6">
              <BusFront size={40} className="mx-auto text-[#6ad7ff]" />
              <p className="mt-4 text-white font-bold text-xl">No buses available for this route</p>
              <p className="text-base text-slate-400 mt-2">Try adjusting your search criteria</p>
            </div>
          )}
        </section>

        {/* Info Banner */}
        <section className="relative container mx-auto px-6 lg:px-12 py-12">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] p-8 md:p-12">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#6ad7ff] font-black">Why Choose Us</p>
                <h3 className="text-3xl font-black mt-3">Premium comfort at unbeatable prices</h3>
                <p className="text-slate-400 mt-4">
                  Enjoy verified operators, comfortable rides, and best price guarantees on all bookings.
                </p>
              </div>
              <div className="flex items-center gap-3 text-[#6ad7ff] font-bold text-sm uppercase tracking-[0.2em] whitespace-nowrap">
                <Sparkles size={18} /> Book with Confidence
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Buses;