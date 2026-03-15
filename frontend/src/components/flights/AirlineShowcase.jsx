import { motion } from "framer-motion";
import fallbackFlightImage from "../../assets/flight.jpg";
import { getOptimizedImageUrl } from "../../utils/media";

const fallbackAirlines = [
  { airline: "Turkish Airlines", image: fallbackFlightImage },
  { airline: "Emirates", image: fallbackFlightImage },
  { airline: "Qatar Airways", image: fallbackFlightImage },
  { airline: "Etihad", image: fallbackFlightImage },
  { airline: "Lufthansa", image: fallbackFlightImage },
];

const AirlineShowcase = ({ flights, onSelectFlight, onOpenFlight, activeFlightId }) => {
  const displayFlights = flights.length > 0 ? flights : fallbackAirlines;

  return (
    <section className="bg-[#f6f7f9] px-[8%] py-20 text-[#111827]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="mx-auto max-w-[1400px]"
      >
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              Airline Partners
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.03em] text-slate-900 lg:text-[32px]">
              Explore Airlines
            </h2>
          </div>
          <p className="hidden max-w-md text-sm leading-6 text-slate-500 lg:block">
            Scroll through premium carriers and pin a flight to the hero by tapping its card action.
          </p>
        </div>

        <div className="flight-scroll-shell -mx-[8%] overflow-hidden px-[8%]">
          <div className="flight-scroll-track flex gap-6 overflow-x-auto pb-6 pt-2">
            {displayFlights.map((flight, index) => {
              const cardImage = flight.image
                ? getOptimizedImageUrl(flight.image, { width: 900 })
                : fallbackFlightImage;
              const isActive = activeFlightId && flight._id === activeFlightId;

              return (
                <motion.article
                  key={flight._id || `${flight.airline}-${index}`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.7, ease: "easeOut", delay: index * 0.08 }}
                  className={`flight-card-float group relative h-[200px] w-[300px] shrink-0 snap-start overflow-hidden rounded-[20px] bg-slate-200 shadow-[0_16px_38px_rgba(15,23,42,0.08)] transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)] ${
                    isActive ? "ring-2 ring-[#7fb3d5] ring-offset-4 ring-offset-[#f6f7f9]" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.6}s` }}
                  onClick={() => {
                    if (onOpenFlight && flight._id) {
                      onOpenFlight(flight);
                      return;
                    }
                    onSelectFlight?.(flight);
                  }}
                >
                  <img
                    src={cardImage}
                    alt={flight.airline}
                    className="h-full w-full rounded-[20px] object-cover transition-transform duration-500 group-hover:scale-[1.08]"
                    loading="lazy"
                    decoding="async"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />

                  <div className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-[14px] border border-white/40 bg-[rgba(255,255,255,0.85)] px-[18px] py-3 shadow-[0_10px_24px_rgba(15,23,42,0.08)] backdrop-blur-[10px]">
                    <div>
                      <p className="text-[14px] font-semibold uppercase tracking-[1px] text-[#111]">
                        {flight.airline}
                      </p>
                      {flight.origin && flight.destination && (
                        <p className="mt-1 text-[11px] uppercase tracking-[0.2em] text-slate-500">
                          {flight.origin} to {flight.destination}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (onOpenFlight && flight._id) {
                          onOpenFlight(flight);
                          return;
                        }
                        onSelectFlight?.(flight);
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#7fb3d5] text-white transition-all duration-300 hover:scale-105 hover:bg-[#5da3cf]"
                      aria-label={`Highlight ${flight.airline}`}
                    >
                      ↗
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default AirlineShowcase;