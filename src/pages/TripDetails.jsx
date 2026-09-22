import { useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import TripSummary from "./TripSummary";
import { useTrip } from "../context/TripContext";
import { useNow } from "../hooks/useNow";
import { ASSUMED_KMH } from "../hooks/useTripCalculations";
import {
  formatAgo,
  formatClock,
  formatDistance,
  formatDuration,
  formatSpeed,
  getSignalStatus,
} from "../utils/tripMath";
import "../styles/TripDetails.css";

const Row = ({ label, value, note }) => (
  <div className="detail-row">
    <dt>{label}</dt>
    <dd>
      {value}
      {note && <small>{note}</small>}
    </dd>
  </div>
);

const Card = ({ title, blurb, children }) => (
  <section className="trip-card detail-card">
    <h2>{title}</h2>
    {blurb && <p className="detail-blurb">{blurb}</p>}
    {children}
  </section>
);

const coord = (value) => (Number.isFinite(value) ? value.toFixed(6) : "—");

// How far the actual arrival was from the first ETA we showed
const describeDifference = (predictedAt, actualAt) => {
  if (!actualAt) return { text: "Waiting for the bus…", tone: "" };
  const diffSec = (actualAt - predictedAt) / 1000;
  if (Math.abs(diffSec) < 60) return { text: "On time", tone: "is-good" };
  const label = formatDuration(Math.abs(diffSec));
  return diffSec > 0 ? { text: `${label} late`, tone: "is-late" } : { text: `${label} early`, tone: "is-early" };
};

const TripDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { trip, stops, busLocation, selectedIndex, setSelectedIndex, calc, arrivals } = useTrip();
  const now = useNow(1000);

  if (!trip.routeData) {
    return (
      <div className="trip-details">
        <div className="trip-card detail-empty">
          <h1>Nothing to show yet</h1>
          <p>Open a bus from search first, then come back here.</p>
          <button type="button" className="trip-primary-btn" onClick={() => navigate("/mainpage")}>
            <FontAwesomeIcon icon={faArrowLeft} /> Back to search
          </button>
        </div>
      </div>
    );
  }

  const { activeStop, activeStatus, activeIndex, distanceKm, previousDistanceKm, motion, etaSeconds } = calc;
  const ageSeconds = busLocation ? Math.max(0, (now - busLocation.timestamp) / 1000) : null;
  const signal = getSignalStatus(ageSeconds);

  let distanceTrend = null;
  if (distanceKm != null && previousDistanceKm != null) {
    const changeM = Math.round((previousDistanceKm - distanceKm) * 1000);
    distanceTrend =
      changeM === 0 ? "no change" : changeM > 0 ? `${changeM} m closer` : `${Math.abs(changeM)} m farther`;
  }

  return (
    <div className="trip-details">
      <header className="detail-topbar">
        <button
          type="button"
          className="trip-icon-btn"
          onClick={() => navigate("/result", { state: location.state })}
          aria-label="Back to the map"
        >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div>
          <h1>Calculation details</h1>
          <p>
            Bus {trip.busNumber} · <span className={`detail-signal is-${signal.tone}`}>{signal.label}</span>
          </p>
        </div>
      </header>

      <div className="detail-body">
        <label className="trip-card detail-picker">
          <span>Calculate for</span>
          <select
            value={selectedIndex ?? ""}
            onChange={(e) => setSelectedIndex(e.target.value === "" ? null : Number(e.target.value))}
          >
            <option value="">Next stop (automatic)</option>
            {stops.map((stop, index) => (
              <option key={index} value={index}>
                {index + 1}. {stop.name || `Stop ${index + 1}`}
              </option>
            ))}
          </select>
        </label>

        <TripSummary calc={calc} hasSignal={Boolean(busLocation)} isSelected={selectedIndex != null} />

        <div className="detail-grid">
          <Card title="Bus location" blurb="Latest position received from the bus.">
            <dl>
              <Row label="Bus number" value={trip.busNumber} />
              <Row label="Latitude" value={coord(busLocation?.latitude)} />
              <Row label="Longitude" value={coord(busLocation?.longitude)} />
              <Row
                label="Last update"
                value={busLocation ? new Date(busLocation.timestamp).toLocaleTimeString() : "—"}
                note={busLocation ? formatAgo(ageSeconds) : undefined}
              />
            </dl>
          </Card>

          <Card title="Selected stop" blurb="The stop these numbers are calculated for.">
            <dl>
              <Row label="Name" value={activeStop?.name || "—"} />
              <Row label="Latitude" value={coord(activeStop?.lat)} />
              <Row label="Longitude" value={coord(activeStop?.lng)} />
              <Row
                label="Stop number"
                value={activeIndex == null ? "—" : `${activeIndex + 1} of ${stops.length}`}
                note={activeStatus === "crossed" ? "passed" : activeStatus === "at" ? "bus is here" : undefined}
              />
            </dl>
          </Card>

          <Card
            title="Distance"
            blurb="Straight-line distance between the bus and the stop, using the Haversine formula."
          >
            <dl>
              <Row label="Distance now" value={formatDistance(distanceKm, 2)} />
              <Row label="Distance at previous reading" value={formatDistance(previousDistanceKm, 2)} />
              <Row label="Change" value={distanceTrend || "—"} />
            </dl>
          </Card>

          <Card title="Speed" blurb="Worked out from how far the bus moved between its last two GPS readings.">
            <dl>
              <Row label="Distance moved" value={motion ? formatDistance(motion.movedKm, 3) : "—"} />
              <Row label="Time between readings" value={motion ? formatDuration(motion.elapsedSec) : "—"} />
              <Row label="Latest speed" value={formatSpeed(motion?.instantKmh)} />
              <Row label="Smoothed speed" value={formatSpeed(calc.liveSpeedKmh)} note="blends recent readings" />
              <Row
                label="Speed used for ETA"
                value={formatSpeed(calc.etaSpeedKmh)}
                note={calc.speedIsLive ? "live" : `assumed — bus is stopped or no data yet (${ASSUMED_KMH} km/h)`}
              />
            </dl>
          </Card>

          <Card title="Estimated arrival" blurb="ETA = distance ÷ speed.">
            <dl>
              <Row label="Distance" value={formatDistance(distanceKm, 2)} />
              <Row label="Speed" value={formatSpeed(calc.etaSpeedKmh)} />
              <Row label="Travel time" value={etaSeconds != null ? formatDuration(etaSeconds) : "—"} />
              <Row
                label="Expected arrival"
                value={etaSeconds != null ? formatClock(now + etaSeconds * 1000) : "—"}
              />
            </dl>
          </Card>

          <Card
            title="ETA accuracy"
            blurb="The first ETA shown for each stop, compared with when the bus really got there."
          >
            {arrivals.length === 0 ? (
              <p className="detail-empty-note">Results appear here once the bus reaches a stop you&apos;re tracking.</p>
            ) : (
              <ul className="accuracy-list">
                {arrivals.map((item) => {
                  const result = describeDifference(item.predictedAt, item.actualAt);
                  return (
                    <li key={item.index}>
                      <div>
                        <strong>{item.name}</strong>
                        <small>
                          Predicted {formatClock(item.predictedAt)} · Actual {formatClock(item.actualAt)}
                        </small>
                      </div>
                      <span className={`accuracy-pill ${result.tone}`}>{result.text}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TripDetails;
