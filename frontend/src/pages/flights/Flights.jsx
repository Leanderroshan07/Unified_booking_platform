import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navbar from "../../components/cinematic/Navbar";
import FlightHero from "../../components/flights/FlightHero";
import AirlineShowcase from "../../components/flights/AirlineShowcase";
import { getFlights } from "../../services/flightService";

const fallbackFlight = {
  airline: "Skyline Premier",
  origin: "Mumbai",
  destination: "Zurich",
  price: 28999,
  duration: "08h 25m",
};

const matchesQuery = (flight, fromQuery, toQuery) => {
  const from = String(flight.origin || "").toLowerCase();
  const to = String(flight.destination || "").toLowerCase();

  const fromMatches = !fromQuery || from.includes(fromQuery);
  const toMatches = !toQuery || to.includes(toQuery);

  return fromMatches && toMatches;
};

const Flights = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [flights, setFlights] = useState([]);
  const [selectedFlight, setSelectedFlight] = useState(fallbackFlight);

  const fromQuery = searchParams.get("from")?.trim().toLowerCase() || "";
  const toQuery = searchParams.get("to")?.trim().toLowerCase() || "";

  useEffect(() => {
    let isMounted = true;

    const loadFlights = async () => {
      try {
        const data = await getFlights();
        if (!isMounted || !Array.isArray(data) || data.length === 0) {
          return;
        }

        const filteredFlights = data.filter((flight) =>
          matchesQuery(flight, fromQuery, toQuery)
        );
        const sourceFlights = filteredFlights.length > 0 ? filteredFlights : data;
        const featuredFlight = sourceFlights.find((flight) => flight.isFeatured);

        setFlights(sourceFlights);
        setSelectedFlight(featuredFlight || sourceFlights[0]);
      } catch (error) {
        console.error("Failed to load flights", error);
      }
    };

    loadFlights();

    return () => {
      isMounted = false;
    };
  }, [fromQuery, toQuery]);

  return (
    <div className="min-h-screen bg-dark-bg text-white selection:bg-[#8BE9FF] selection:text-[#071126]">
      <Navbar />

      <main>
        <FlightHero flight={selectedFlight} />
        <AirlineShowcase
          flights={flights}
          activeFlightId={selectedFlight?._id}
          onSelectFlight={setSelectedFlight}
          onOpenFlight={(flight) => navigate(`/flights/${flight._id}`)}
        />
      </main>
    </div>
  );
};

export default Flights;