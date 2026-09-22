import { useMemo, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { TripContext } from "../context/TripContext";
import { useBusLocation } from "../hooks/useBusLocation";
import { useTripCalculations } from "../hooks/useTripCalculations";
import { useArrivalAccuracy } from "../hooks/useArrivalAccuracy";
import "../styles/TripTheme.css";

// Owns the live data for /result and /result/details so both pages show the same numbers
const TripLayout = () => {
  const location = useLocation();
  // Keep the first state we were given so a page switch never resets the trip
  const [trip] = useState(() => location.state || {});
  const { routeData, routes, busNumber } = trip;

  const stops = useMemo(() => {
    const raw = Array.isArray(routeData?.routeDetails?.stops)
      ? routeData.routeDetails.stops
      : (routes || []).flatMap((route) => route.stops || []);

    return raw.map((stop) => ({ ...stop, lat: Number(stop.lat), lng: Number(stop.lng) }));
  }, [routeData, routes]);

  const [selectedIndex, setSelectedIndex] = useState(null);
  const busLocation = useBusLocation(busNumber);
  const calc = useTripCalculations({ busLocation, stops, selectedIndex });
  const arrivals = useArrivalAccuracy({
    stops,
    statuses: calc.statuses,
    activeIndex: calc.activeIndex,
    etaSeconds: calc.etaSeconds,
  });

  const value = { trip, stops, busNumber, busLocation, selectedIndex, setSelectedIndex, calc, arrivals };

  return (
    <TripContext.Provider value={value}>
      <Outlet />
    </TripContext.Provider>
  );
};

export default TripLayout;
