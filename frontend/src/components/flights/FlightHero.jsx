import { motion } from "framer-motion";
import { ArrowRight, PlaneTakeoff } from "lucide-react";
import bgImage from "../../assets/flight_bg.jpg";
import flightModelImage from "../../assets/flight_model.jpg";
import { formatINR } from "../../utils/currency";

const heroFade = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut", delay },
  }),
};

const formatFlightMoment = (value) => {
  if (!value) return "Flexible schedule";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Flexible schedule";

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const FlightHero = ({ flight }) => {
  const planeImage = flightModelImage;

  return (
    <section className="relative isolate flex min-h-screen items-center overflow-hidden px-[10%] pb-[100px] pt-[120px]">
      <div
        className="absolute inset-0 -z-30 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="absolute inset-0 -z-20 bg-[linear-gradient(115deg,rgba(7,17,38,0.96)_0%,rgba(7,17,38,0.88)_42%,rgba(63,10,20,0.92)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_68%_48%,rgba(139,233,255,0.18),transparent_22%),radial-gradient(circle_at_48%_50%,transparent_12%,rgba(0,0,0,0.34)_75%,rgba(0,0,0,0.65)_100%)]" />
      <div className="pointer-events-none absolute right-[12%] top-1/2 -z-10 h-[360px] w-[360px] -translate-y-1/2 rounded-full bg-cyan-300/20 blur-[110px] lg:h-[460px] lg:w-[460px]" />

      <div className="grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="max-w-[620px] text-center lg:text-left">
          <motion.p
            custom={0}
            initial="hidden"
            animate="visible"
            variants={heroFade}
            className="mb-5 inline-flex rounded-full border border-white/10 bg-white/6 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/65 backdrop-blur-xl"
          >
            Premium Flight Booking
          </motion.p>

          <div className="space-y-1 font-poppins leading-[1.1] tracking-[-0.04em] text-white">
            <motion.h1
              custom={0.1}
              initial="hidden"
              animate="visible"
              variants={heroFade}
              className="text-[42px] font-semibold sm:text-[50px] lg:text-[64px]"
            >
              Enjoy your
            </motion.h1>
            <motion.h2
              custom={0.2}
              initial="hidden"
              animate="visible"
              variants={heroFade}
              className="flight-dream-glow text-[48px] font-bold text-[#8BE9FF] sm:text-[56px] lg:text-[72px]"
            >
              Dream
            </motion.h2>
            <motion.h3
              custom={0.3}
              initial="hidden"
              animate="visible"
              variants={heroFade}
              className="text-[42px] font-semibold sm:text-[50px] lg:text-[64px]"
            >
              Vacation
            </motion.h3>
          </div>

          <motion.p
            custom={0.4}
            initial="hidden"
            animate="visible"
            variants={heroFade}
            className="mt-6 mx-auto max-w-[420px] text-base font-normal leading-7 text-white/70 lg:mx-0 lg:text-[18px]"
          >
            Book Hotels, Flights and Stay packages at the lowest price
          </motion.p>

          <motion.div
            custom={0.5}
            initial="hidden"
            animate="visible"
            variants={heroFade}
            className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2"
          >
            <div className="group relative overflow-hidden rounded-[24px] border border-[#8BE9FF]/30 bg-[linear-gradient(145deg,rgba(7,17,38,0.86),rgba(26,44,70,0.6))] px-5 py-4 text-left shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
              <div className="absolute -right-5 -top-6 h-24 w-24 rounded-full bg-[#8BE9FF]/15 blur-2xl transition-opacity group-hover:opacity-100" />
              <div className="relative flex items-center gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#8BE9FF]/18 text-[#8BE9FF] ring-1 ring-[#8BE9FF]/35">
                  <PlaneTakeoff size={20} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#8BE9FF]/70">Featured Route</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {flight ? `${flight.origin} to ${flight.destination}` : "Curated global escapes"}
                  </p>
                  <p className="mt-1 text-xs text-white/55">{formatFlightMoment(flight?.departureTime)}</p>
                </div>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-[24px] border border-white/15 bg-[linear-gradient(145deg,rgba(63,10,20,0.5),rgba(7,17,38,0.86))] px-5 py-4 text-left shadow-[0_24px_60px_rgba(0,0,0,0.24)]">
              <div className="absolute -left-4 -bottom-6 h-24 w-24 rounded-full bg-[#ff8a65]/20 blur-2xl" />
              <div className="relative flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.28em] text-[#ffd3c8]/70">Starting From</p>
                  <p className="mt-1 text-2xl font-black text-white">
                    {flight?.price ? formatINR(flight.price) : "Premium fares"}
                  </p>
                  <p className="text-xs text-white/55">per passenger</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-white/75 ring-1 ring-white/25 transition-all group-hover:translate-x-0.5">
                  <ArrowRight size={18} />
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="relative mx-auto flex w-full max-w-[650px] items-center justify-center lg:justify-end"
        >
          <div className="flight-aircraft-glow pointer-events-none absolute inset-y-[10%] right-[10%] hidden w-[70%] rounded-full bg-cyan-300/30 blur-[120px] lg:block" />
          <div className="flight-aircraft-wrap relative flex w-full items-center justify-center lg:justify-end">
            <img
              src={planeImage}
              alt={flight?.airline || "Premium flight"}
              className="relative z-10 max-w-full object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)] lg:max-w-[650px]"
            />

            
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default FlightHero;