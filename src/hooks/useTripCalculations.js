import { useEffect, useMemo, useRef, useState } from "react";
import { haversineKm, getRouteProgress } from "../utils/tripMath";

// Ignore GPS jumps (e.g. the simulated route restarting)
const MAX_PLAUSIBLE_KMH = 120;
// Below this the bus is treated as stationary and ETA falls back to a typical city speed
const MIN_MOVING_KMH = 5;
export const ASSUMED_KMH = 25;
// Weight of the newest reading when smoothing speed
const SMOOTHING = 0.4;

/**
 * Distance, speed, ETA and stop progress for a bus on a route.
 * Shared by the map page and the details page so both always agree.
 *
 * stops: [{ name, lat, lng }] in route order
 * selectedIndex: stop the passenger picked, or null to track the next stop
 */
export const useTripCalculations = ({ busLocation, stops, selectedIndex }) => {
  const [motion, setMotion] = useState(null);
  const lastSampleRef = useRef(null);
  const crossedRef = useRef({ key: "", count: 0 });

  // Speed from the distance the bus travelled between its last two GPS readings
  useEffect(() => {
    if (!busLocation) return;

    const previous = lastSampleRef.current;
    if (previous && previous.timestamp === busLocation.timestamp) return;
    lastSampleRef.current = busLocation;
    if (!previous) return;

    const elapsedSec = (busLocation.timestamp - previous.timestamp) / 1000;
    const movedKm = haversineKm(
      previous.latitude,
      previous.longitude,
      busLocation.latitude,
      busLocation.longitude
    );
    if (elapsedSec <= 0 || movedKm == null) return;

    const instantKmh = (movedKm / elapsedSec) * 3600;
    if (instantKmh > MAX_PLAUSIBLE_KMH) return;

    setMotion((current) => ({
      previous,
      movedKm,
      elapsedSec,
      instantKmh,
      speedKmh:
        current?.speedKmh == null
          ? instantKmh
          : current.speedKmh * (1 - SMOOTHING) + instantKmh * SMOOTHING,
    }));
  }, [busLocation]);

  const stopsKey = useMemo(() => JSON.stringify(stops.map((s) => [s.lat, s.lng])), [stops]);

  // crossed / at / upcoming for every stop. "Crossed" never un-crosses on GPS jitter.
  const statuses = useMemo(() => {
    const progress = getRouteProgress(busLocation, stops);
    const latch = crossedRef.current;

    // New route, or the bus restarted the trip: forget what was crossed
    if (latch.key !== stopsKey || progress.crossedCount + 1 < latch.count) {
      latch.key = stopsKey;
      latch.count = progress.crossedCount;
    } else {
      latch.count = Math.max(latch.count, progress.crossedCount);
    }

    return stops.map((_, i) => {
      if (i === progress.atIndex) return "at";
      return i < latch.count ? "crossed" : "upcoming";
    });
  }, [busLocation, stops, stopsKey]);

  const nextIndex = statuses.indexOf("upcoming");
  // A picked stop stays tracked until the bus passes it, then tracking moves on to the next stop
  const trackingPickedStop = selectedIndex != null && statuses[selectedIndex] !== "crossed";
  const activeIndex = trackingPickedStop ? selectedIndex : nextIndex === -1 ? null : nextIndex;
  const activeStop = activeIndex == null ? null : stops[activeIndex] ?? null;
  const activeStatus = activeIndex == null ? null : statuses[activeIndex];

  const stopDistancesKm = useMemo(
    () =>
      stops.map((stop) =>
        busLocation ? haversineKm(busLocation.latitude, busLocation.longitude, stop.lat, stop.lng) : null
      ),
    [busLocation, stops]
  );

  const distanceKm = activeIndex == null ? null : stopDistancesKm[activeIndex];
  const previousDistanceKm =
    motion?.previous && activeStop
      ? haversineKm(motion.previous.latitude, motion.previous.longitude, activeStop.lat, activeStop.lng)
      : null;

  const liveSpeedKmh = motion?.speedKmh ?? null;
  const speedIsLive = liveSpeedKmh != null && liveSpeedKmh >= MIN_MOVING_KMH;
  const etaSpeedKmh = speedIsLive ? liveSpeedKmh : ASSUMED_KMH;

  const etaSeconds =
    distanceKm != null && activeStatus === "upcoming" ? (distanceKm / etaSpeedKmh) * 3600 : null;

  return {
    statuses,
    nextIndex: nextIndex === -1 ? null : nextIndex,
    activeIndex,
    trackingPickedStop,
    activeStop,
    activeStatus,
    stopDistancesKm,
    distanceKm,
    previousDistanceKm,
    motion,
    liveSpeedKmh,
    speedIsLive,
    // Speed the bus itself reports (0 while it waits at a stop)
    reportedSpeedKmh: Number.isFinite(busLocation?.speed) ? busLocation.speed : null,
    etaSpeedKmh,
    etaSeconds,
  };
};
