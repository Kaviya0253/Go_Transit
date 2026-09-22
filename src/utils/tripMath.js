const EARTH_RADIUS_KM = 6371;
const MAX_OFF_ROUTE_KM = 3;

// Bus counts as "at" a stop when it is this close (km)
export const AT_STOP_KM = 0.1;

const toRad = (deg) => (deg * Math.PI) / 180;

export const haversineKm = (lat1, lon1, lat2, lon2) => {
  if (![lat1, lon1, lat2, lon2].every(Number.isFinite)) return null;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Firebase timestamps arrive as ISO strings or epoch millis
export const toTimeMs = (value) => {
  if (value == null) return null;
  const ms = typeof value === "number" ? value : Date.parse(value);
  return Number.isFinite(ms) ? ms : null;
};

/**
 * Works out how far along the route the bus is.
 * Projects the bus onto each stop-to-stop segment and picks the closest one:
 *  - before the segment start  -> stops before it are crossed
 *  - inside the segment        -> its first stop is crossed
 *  - past the end (last leg)   -> every stop is crossed
 */
export const getRouteProgress = (bus, stops) => {
  const none = { crossedCount: 0, atIndex: null };
  if (!bus || stops.length === 0) return none;

  let atIndex = null;
  let nearest = AT_STOP_KM;
  stops.forEach((stop, i) => {
    const d = haversineKm(bus.latitude, bus.longitude, stop.lat, stop.lng);
    if (d != null && d <= nearest) {
      nearest = d;
      atIndex = i;
    }
  });

  if (stops.length < 2) return { crossedCount: 0, atIndex };

  const kmPerDeg = EARTH_RADIUS_KM * toRad(1);
  const kmPerLng = kmPerDeg * Math.cos(toRad(bus.latitude));
  // Flat x/y in km with the bus at the origin
  const toXY = (stop) => ({
    x: (stop.lng - bus.longitude) * kmPerLng,
    y: (stop.lat - bus.latitude) * kmPerDeg,
  });

  let best = null;
  for (let i = 0; i < stops.length - 1; i++) {
    const a = toXY(stops[i]);
    const b = toXY(stops[i + 1]);
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const lengthSq = dx * dx + dy * dy;
    const t = lengthSq === 0 ? 0 : (-a.x * dx - a.y * dy) / lengthSq;
    const clamped = Math.min(1, Math.max(0, t));
    const distance = Math.hypot(a.x + clamped * dx, a.y + clamped * dy);

    if (!best || distance < best.distance) best = { i, t, distance };
  }

  if (!best || best.distance > MAX_OFF_ROUTE_KM) return { crossedCount: 0, atIndex };

  const isLastLeg = best.i === stops.length - 2;
  let crossedCount = best.i + 1;
  if (best.t <= 0) crossedCount = best.i;
  else if (best.t >= 1 && isLastLeg) crossedCount = stops.length;

  return { crossedCount, atIndex };
};

export const formatDuration = (seconds) => {
  if (!Number.isFinite(seconds)) return "—";
  const total = Math.round(seconds);
  if (total < 60) return `${total} sec`;

  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
};

export const formatDistance = (km, decimals = 1) => {
  if (!Number.isFinite(km)) return "—";
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(decimals)} km`;
};

export const formatSpeed = (kmh) => (Number.isFinite(kmh) ? `${kmh.toFixed(1)} km/h` : "—");

export const formatClock = (ms) =>
  Number.isFinite(ms)
    ? new Date(ms).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "—";

export const formatAgo = (seconds) => {
  if (!Number.isFinite(seconds)) return "—";
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${Math.round(seconds)}s ago`;
  return `${Math.floor(seconds / 60)} min ago`;
};

// How fresh the bus feed is, for the status chip
export const getSignalStatus = (ageSeconds) => {
  if (ageSeconds == null) return { tone: "idle", label: "Waiting for bus signal" };
  if (ageSeconds <= 30) return { tone: "live", label: `Live · ${formatAgo(ageSeconds)}` };
  if (ageSeconds <= 120) return { tone: "warn", label: `Delayed · ${formatAgo(ageSeconds)}` };
  return { tone: "lost", label: "Signal lost" };
};
