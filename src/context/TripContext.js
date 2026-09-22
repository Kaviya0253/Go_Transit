import { createContext, useContext } from "react";

export const TripContext = createContext(null);

export const useTrip = () => {
  const trip = useContext(TripContext);
  if (!trip) throw new Error("useTrip must be used inside <TripLayout>");
  return trip;
};
