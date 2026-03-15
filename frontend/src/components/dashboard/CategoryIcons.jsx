import { motion } from "framer-motion";
import movie from "../../assets/movie.jpg";
import hotel from "../../assets/hotel.jpg";
import flight from "../../assets/flight.jpg";
import train from "../../assets/train.jpg";
import bus from "../../assets/bus.jpg";

const CategoryIcons = ({ activeTab, setActiveTab }) => {
  const categories = [
    { name: "Movies", icon: movie },
    { name: "Hotels", icon: hotel },
    { name: "Flights", icon: flight },
    { name: "Trains", icon: train },
    { name: "Buses", icon: bus },
  ];

  return (
    <div className="flex flex-wrap gap-6">
      {categories.map((item) => (
        <motion.div
          key={item.name}
          whileHover={{ y: -5, scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setActiveTab(item.name)}
          className={`relative cursor-pointer group flex flex-col items-center gap-3 p-4 rounded-2xl min-w-[100px] transition-all border ${activeTab === item.name
              ? "bg-brand-red border-brand-red shadow-[0_10px_20px_rgba(255,42,42,0.3)]"
              : "bg-white/5 border-white/10 hover:bg-white/10"
            }`}
        >
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
            <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
          </div>
          <span className={`text-sm font-bold tracking-tight ${activeTab === item.name ? "text-white" : "text-gray-400 group-hover:text-white"
            }`}>
            {item.name}
          </span>

          {activeTab === item.name && (
            <motion.div
              layoutId="activeTabGlow"
              className="absolute inset-0 bg-brand-red/20 blur-xl -z-10 rounded-full"
            />
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default CategoryIcons;
