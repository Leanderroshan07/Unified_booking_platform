import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, MapPin, Calendar, Hotel } from "lucide-react";

const SearchBar = ({ activeTab }) => {
  const [location, setLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [travelDate, setTravelDate] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e) e.preventDefault();

    // Read directly from form controls to avoid stale-state submissions.
    const formData = e?.currentTarget ? new FormData(e.currentTarget) : null;
    const query = String(formData?.get("location") ?? location).trim();
    const from = String(formData?.get("from") ?? location).trim();
    const to = String(formData?.get("to") ?? destination).trim();
    const date = String(formData?.get("date") ?? travelDate).trim();

    if (activeTab === "Movies") {
      if (!query) return;
      navigate(`/movies?location=${encodeURIComponent(query)}`);
    } else if (activeTab === "Hotels") {
      if (!query) return;
      navigate(`/hotels?location=${encodeURIComponent(query)}`);
    } else if (activeTab === "Flights") {
      const searchParams = new URLSearchParams();
      if (from) searchParams.set("from", from);
      if (to) searchParams.set("to", to);
      if (date) searchParams.set("date", date);
      navigate(`/flights${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
    } else if (activeTab === "Trains") {
      const searchParams = new URLSearchParams();
      if (from) searchParams.set("from", from);
      if (to) searchParams.set("to", to);
      if (date) searchParams.set("date", date);
      navigate(`/trains${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
    } else if (activeTab === "Buses") {
      const searchParams = new URLSearchParams();
      if (from) searchParams.set("from", from);
      if (to) searchParams.set("to", to);
      if (date) searchParams.set("date", date);
      navigate(`/buses${searchParams.toString() ? `?${searchParams.toString()}` : ""}`);
    } else {
      console.log(`Searching for ${activeTab}: ${query}`);
    }
  };

  const InputWrapper = ({ icon: Icon, children }) => (
    <div className="relative flex-1 group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-brand-red transition-colors pointer-events-none">
        <Icon size={18} />
      </div>
      {children}
    </div>
  );

  const baseInputClass = "w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-brand-red transition-all text-white placeholder:text-gray-600 focus:bg-white/10";

  return (
    <form onSubmit={handleSearch} className="w-full">
      {activeTab === "Movies" && (
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <InputWrapper icon={MapPin}>
            <input
              placeholder="Enter your location (e.g. Mumbai, New York)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              name="location"
              className={baseInputClass}
            />
          </InputWrapper>
          <button
            type="submit"
            className="bg-brand-red px-10 py-4 rounded-xl font-bold text-white shadow-[0_10px_20px_rgba(255,42,42,0.3)] hover:shadow-[0_10px_30px_rgba(255,42,42,0.5)] transition-all flex items-center justify-center gap-2 group transform active:scale-95"
          >
            <Search size={18} />
            SEARCH MOVIES
          </button>
        </div>
      )}

      {activeTab === "Hotels" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <InputWrapper icon={Hotel}>
            <input
              placeholder="City / Hotel name"
              className={baseInputClass}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              name="location"
            />
          </InputWrapper>
          <InputWrapper icon={Calendar}>
            <input type="date" placeholder="Check-in" className={baseInputClass} />
          </InputWrapper>
          <InputWrapper icon={Calendar}>
            <input type="date" placeholder="Check-out" className={baseInputClass} />
          </InputWrapper>
          <button
            type="submit"
            className="bg-brand-red px-8 py-4 rounded-xl font-bold text-white shadow-[0_10px_20px_rgba(255,42,42,0.3)] hover:bg-brand-red/90 transition-all font-serif uppercase tracking-widest"
          >
            SEARCH HOTELS
          </button>
        </div>
      )}

      {activeTab === "Flights" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <InputWrapper icon={MapPin}>
            <input
              placeholder="From"
              className={baseInputClass}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              name="from"
            />
          </InputWrapper>
          <InputWrapper icon={MapPin}>
            <input
              placeholder="To"
              className={baseInputClass}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              name="to"
            />
          </InputWrapper>
          <InputWrapper icon={Calendar}>
            <input
              type="date"
              className={baseInputClass}
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              name="date"
            />
          </InputWrapper>
          <button type="submit" className="bg-brand-red px-8 py-4 rounded-xl font-bold text-white transition-all uppercase">
            SEARCH FLIGHTS
          </button>
        </div>
      )}

      {["Trains", "Buses"].includes(activeTab) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          <InputWrapper icon={MapPin}>
            <input
              placeholder="From"
              className={baseInputClass}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              name="from"
            />
          </InputWrapper>
          <InputWrapper icon={MapPin}>
            <input
              placeholder="To"
              className={baseInputClass}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              name="to"
            />
          </InputWrapper>
          <InputWrapper icon={Calendar}>
            <input
              type="date"
              className={baseInputClass}
              value={travelDate}
              onChange={(e) => setTravelDate(e.target.value)}
              name="date"
            />
          </InputWrapper>
          <button type="submit" className="bg-brand-red px-8 py-4 rounded-xl font-bold text-white transition-all uppercase">
            SEARCH {activeTab}
          </button>
        </div>
      )}
    </form>
  );
};

export default SearchBar;

