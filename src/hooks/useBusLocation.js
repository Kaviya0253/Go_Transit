import { useEffect, useState } from "react";
import { ref, onValue } from "firebase/database";
import { database } from "../firebaseConfig";
import { toTimeMs } from "../utils/tripMath";

// Live position of one bus: { busNumber, latitude, longitude, timestamp (ms), speed, status, nextStop, currentStop, waitSeconds } or null
export const useBusLocation = (busNumber) => {
  const [busLocation, setBusLocation] = useState(null);

  useEffect(() => {
    if (!busNumber) return;

    const locationRef = ref(database, `routes/buses/${busNumber}/location`);
    const unsubscribe = onValue(locationRef, (snapshot) => {
      if (!snapshot.exists()) {
        setBusLocation(null);
        return;
      }

      const { latitude, longitude, timestamp, speed, status, nextStop, currentStop, waitSeconds, tripStartedAt } = snapshot.val();
      const lat = Number(latitude);
      const lng = Number(longitude);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setBusLocation(null);
        return;
      }

      setBusLocation({
        busNumber,
        latitude: lat,
        longitude: lng,
        timestamp: toTimeMs(timestamp) ?? Date.now(),
        speed: Number.isFinite(Number(speed)) ? Number(speed) : undefined,
        status,
        tripStartedAt: toTimeMs(tripStartedAt) ?? undefined,
        nextStop,
        currentStop,
        waitSeconds: Number.isFinite(Number(waitSeconds)) ? Number(waitSeconds) : 0,
      });
    });

    return unsubscribe;
  }, [busNumber]);

  return busLocation;
};
