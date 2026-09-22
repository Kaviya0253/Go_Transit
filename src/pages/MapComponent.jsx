import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, Marker, OverlayView, OverlayViewF } from "@react-google-maps/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationCrosshairs } from "@fortawesome/free-solid-svg-icons";
import "../styles/MapComponent.css";

const DEFAULT_CENTER = { lat: 13.0827, lng: 80.2707 };
const FOLLOW_ZOOM = 16;

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  // Hide shops / landmarks so the route and stops stand out
  styles: [
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "transit.station", stylers: [{ visibility: "off" }] },
  ],
};

const REMAINING_LINE = { strokeColor: "#2563eb", strokeOpacity: 0.85, strokeWeight: 5 };
const COVERED_LINE = { strokeColor: "#f97316", strokeOpacity: 0.9, strokeWeight: 5 };

const STOP_COLORS = { crossed: "#94a3b8", at: "#16a34a", upcoming: "#2563eb" };

const dot = ({ fill, stroke, scale, weight }) => ({
  path: window.google.maps.SymbolPath.CIRCLE,
  fillColor: fill,
  fillOpacity: 1,
  strokeColor: stroke,
  strokeWeight: weight,
  scale,
});

// Glides the bus from its old position to each new one instead of jumping (about 20 updates a second)
const GLIDE_MS = 2000;
const useSmoothPosition = (target) => {
  const [position, setPosition] = useState(target);
  const current = useRef(target);

  useEffect(() => {
    if (!target) return undefined;
    if (!current.current) {
      current.current = target;
      setPosition(target);
      return undefined;
    }

    const from = current.current;
    const startedAt = performance.now();
    let lastDraw = 0;
    let frame;
    const step = (now) => {
      const t = Math.min((now - startedAt) / GLIDE_MS, 1);
      current.current = {
        lat: from.lat + (target.lat - from.lat) * t,
        lng: from.lng + (target.lng - from.lng) * t,
      };
      if (t === 1 || now - lastDraw > 50) {
        lastDraw = now;
        setPosition(current.current);
      }
      if (t < 1) frame = requestAnimationFrame(step);
    };
    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target?.lat, target?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  return position;
};

const MapComponent = ({ stops = [], path = [], busLocations = [], statuses = [], activeIndex = null }) => {
  const [map, setMap] = useState(null);
  const [directions, setDirections] = useState(null);
  const [following, setFollowing] = useState(false);

  const bus = busLocations[0];
  const livePosition = useMemo(
    () => (bus ? { lat: bus.latitude, lng: bus.longitude } : null),
    [bus]
  );
  const busPosition = useSmoothPosition(livePosition);

  // Every point of the route, in order: the bus's own path if we have it, else Google's road route
  const routePath = useMemo(() => {
    if (path.length > 1) return path;
    const legs = directions?.routes?.[0]?.legs || [];
    return legs.flatMap((leg) => leg.steps.flatMap((step) => step.path.map((p) => ({ lat: p.lat(), lng: p.lng() }))));
  }, [path, directions]);

  // Which point of the route the bus is at (updates with each live reading)
  const nearestIndex = useMemo(() => {
    if (!livePosition || routePath.length === 0) return null;
    let nearest = 0;
    let best = Infinity;
    routePath.forEach((p, i) => {
      const d = (p.lat - livePosition.lat) ** 2 + (p.lng - livePosition.lng) ** 2;
      if (d < best) {
        best = d;
        nearest = i;
      }
    });
    return nearest;
  }, [routePath, livePosition]);

  // The route is drawn as two lines: orange where the bus has been, blue where it is going.
  // They are created once and updated in place. (Letting React re-create them left a stale
  // full-length blue line on top of the orange one.)
  const coveredLine = useRef(null);
  const remainingLine = useRef(null);

  useEffect(() => {
    if (!map) return undefined;
    coveredLine.current = new window.google.maps.Polyline({ ...COVERED_LINE, map, zIndex: 2 });
    remainingLine.current = new window.google.maps.Polyline({ ...REMAINING_LINE, map, zIndex: 1 });
    return () => {
      coveredLine.current?.setMap(null);
      remainingLine.current?.setMap(null);
      coveredLine.current = null;
      remainingLine.current = null;
    };
  }, [map]);

  // Re-split the route each time the bus reaches a new point of it
  useEffect(() => {
    if (!coveredLine.current || !remainingLine.current) return;
    if (nearestIndex === null) {
      coveredLine.current.setPath([]);
      remainingLine.current.setPath(routePath);
    } else {
      coveredLine.current.setPath(routePath.slice(0, nearestIndex + 1));
      remainingLine.current.setPath(routePath.slice(nearestIndex));
    }
  }, [map, routePath, nearestIndex]);

  // Keep the join between the two lines exactly under the gliding bus
  useEffect(() => {
    if (!busPosition || nearestIndex === null) return;
    const join = new window.google.maps.LatLng(busPosition.lat, busPosition.lng);
    const covered = coveredLine.current?.getPath();
    const remaining = remainingLine.current?.getPath();
    if (covered && covered.getLength() > 0) covered.setAt(covered.getLength() - 1, join);
    if (remaining && remaining.getLength() > 0) remaining.setAt(0, join);
  }, [busPosition, nearestIndex]);

  // Road route through the stops, kept in the order given
  useEffect(() => {
    if (path.length > 1 || !window.google?.maps || stops.length < 2) return;

    const toPoint = ({ lat, lng }) => ({ lat, lng });
    new window.google.maps.DirectionsService().route(
      {
        origin: toPoint(stops[0]),
        destination: toPoint(stops[stops.length - 1]),
        waypoints: stops.slice(1, -1).map((stop) => ({ location: toPoint(stop), stopover: true })),
        travelMode: window.google.maps.TravelMode.DRIVING,
        optimizeWaypoints: false,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) setDirections(result);
        else console.error("Directions request failed:", status);
      }
    );
  }, [stops, path]);

  // Open zoomed in on the bus and follow it; show the whole route only until the bus location arrives
  const startedOnBus = useRef(false);
  useEffect(() => {
    if (!map || startedOnBus.current) return;

    if (busPosition) {
      map.setCenter(busPosition);
      map.setZoom(FOLLOW_ZOOM);
      setFollowing(true);
      startedOnBus.current = true;
    } else if (stops.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      stops.forEach(({ lat, lng }) => bounds.extend({ lat, lng }));
      map.fitBounds(bounds, { top: 72, right: 32, bottom: 56, left: 32 });
    }
  }, [map, stops, busPosition]);

  // Glide along with the bus once the passenger asks to follow it
  useEffect(() => {
    if (map && following && busPosition) map.setCenter(busPosition);
  }, [map, following, busPosition]);

  const handleLocate = useCallback(() => {
    if (!map || !busPosition) return;
    setFollowing(true);
    map.panTo(busPosition);
    if ((map.getZoom() ?? 0) < FOLLOW_ZOOM) map.setZoom(FOLLOW_ZOOM);
  }, [map, busPosition]);

  const lastIndex = stops.length - 1;

  // While the bus waits at a stop: which stop, so the message box can sit right at it
  const atStop = bus?.status === "At stop";
  const waitingStop = useMemo(() => {
    const stop = atStop ? stops.find((s) => s.name === bus.currentStop) : null;
    return stop ? { lat: stop.lat, lng: stop.lng } : null;
  }, [atStop, bus?.currentStop, stops]);

  return (
    <div className="map-container">
      <GoogleMap
        mapContainerClassName="map"
        center={stops[0] || DEFAULT_CENTER}
        zoom={13}
        options={mapOptions}
        onLoad={setMap}
        onDragStart={() => setFollowing(false)}
      >

        {stops.map((stop, index) => {
          const status = statuses[index] || "upcoming";
          const isEnd = index === 0 || index === lastIndex;
          const isActive = index === activeIndex;

          if (isEnd) {
            return (
              <Marker
                key={index}
                position={stop}
                title={stop.name}
                zIndex={1000}
                icon={dot({ fill: index === 0 ? "#16a34a" : "#dc2626", stroke: "#ffffff", scale: 13, weight: 3 })}
                label={{ text: index === 0 ? "A" : "B", color: "#ffffff", fontWeight: "600", fontSize: "13px" }}
              />
            );
          }

          return (
            <Marker
              key={index}
              position={stop}
              title={stop.name}
              zIndex={isActive ? 1100 : 900}
              icon={dot({
                fill: isActive ? STOP_COLORS.upcoming : "#ffffff",
                stroke: isActive ? "#ffffff" : STOP_COLORS[status],
                scale: isActive ? 9 : 6,
                weight: isActive ? 3 : 2.5,
              })}
            />
          );
        })}

        {busPosition && (
          <Marker
            position={busPosition}
            title={`Bus ${bus.busNumber}`}
            zIndex={1500}
            icon={dot({ fill: atStop ? "#dc2626" : "#0f172a", stroke: "#ffffff", scale: 17, weight: 3 })}
            label={{ text: "🚌", fontSize: "16px" }}
          />
        )}
        {busPosition && atStop && (
          <OverlayViewF
            position={waitingStop || busPosition}
            mapPaneName={OverlayView.FLOAT_PANE}
            getPixelPositionOffset={(width, height) => ({ x: -width / 2, y: -height - 22 })}
          >
            <div className="bus-stop-bubble" role="status" aria-live="polite">
              <strong>Bus stopped</strong>
              <span className="bus-stop-bubble-stop">{bus.currentStop}</span>
              <span className="bus-stop-bubble-wait">Waiting time left: {bus.waitSeconds}s</span>
            </div>
          </OverlayViewF>
        )}
      </GoogleMap>

      {busPosition && (
        <button
          type="button"
          className={`map-locate-btn${following ? " is-following" : ""}`}
          onClick={handleLocate}
          aria-label="Follow the bus"
          aria-pressed={following}
        >
          <FontAwesomeIcon icon={faLocationCrosshairs} />
        </button>
      )}
    </div>
  );
};

export default MapComponent;
