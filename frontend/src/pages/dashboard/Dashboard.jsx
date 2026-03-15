import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../../components/cinematic/Navbar";
import SearchBar from "../../components/dashboard/SearchBar";
import bg from "../../assets/dashboard-bg.jpg";
import movieImg from "../../assets/movie.jpg";
import hotelImg from "../../assets/hotel.jpg";
import flightImg from "../../assets/flight.jpg";
import trainImg from "../../assets/train.jpg";
import busImg from "../../assets/bus.jpg";
import MagicBento from "../../components/MagicBento";
import AIAssistantWidget from "../../components/dashboard/AIAssistantWidget";

const categories = ["Movies", "Hotels", "Flights", "Trains", "Buses"];
const categoryImages = {
  Movies: movieImg,
  Hotels: hotelImg,
  Flights: flightImg,
  Trains: trainImg,
  Buses: busImg,
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Movies");
  const [displayName, setDisplayName] = useState("Traveler");

  useEffect(() => {
    const rawUser = localStorage.getItem("user");
    if (!rawUser) return;

    try {
      const parsedUser = JSON.parse(rawUser);
      const username = String(parsedUser?.username || "").trim();
      if (username) {
        setDisplayName(username);
      }
    } catch {
      // Ignore malformed local storage payload.
    }
  }, []);

  const gooeyItems = categories.map((name) => ({
    label: name,
    href: "#",
  }));

  const handleGooeyClick = (index, item) => {
    setActiveTab(item.label);
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white selection:bg-brand-red selection:text-white">
      <Navbar />

      <main className="relative min-h-screen flex items-center pt-20">
        <div
          className="absolute inset-0 bg-cover bg-center z-0 transition-all duration-700"
          style={{ backgroundImage: `url(${bg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-dark-bg via-dark-bg/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-transparent to-transparent" />
        </div>

        <div className="container mx-auto px-6 lg:px-12 relative z-10 w-full">
          <motion.div
            initial={{ opacity: 1, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="max-w-4xl"
          >
            <p className="text-brand-red font-bold tracking-widest uppercase mb-4 text-sm">Universal Booking</p>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.95] font-poppins">
              Welcome, {displayName}
            </h1>
            <p className="mt-2 mb-2 text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tighter leading-[0.95] font-poppins text-slate-400">
              Discover your next journey.
            </p>

            <div className="mt-12 space-y-8">
              <div className="w-full relative min-h-[120px]">
                <MagicBento
                  items={gooeyItems.map((item) => ({
                    title: item.label,
                    image: categoryImages[item.label],
                    label: item.label,
                  }))}
                  onItemClick={(index, item) => handleGooeyClick(index, { label: item.title })}
                  activeItemIndex={categories.indexOf(activeTab)}
                  textAutoHide={true}
                  enableStars={true}
                  enableSpotlight={true}
                  enableBorderGlow={true}
                  enableTilt={false}
                  enableMagnetism={false}
                  clickEffect={true}
                  spotlightRadius={400}
                  particleCount={12}
                  glowColor="255, 42, 42"
                />
              </div>

              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <SearchBar activeTab={activeTab} />
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="absolute top-[20%] right-[10%] w-[500px] h-[500px] bg-brand-red/10 rounded-full blur-[150px] z-0 animate-pulse" />
      </main>

      <AIAssistantWidget />
    </div>
  );
};

export default Dashboard;
