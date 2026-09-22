import { formatClock, formatDistance, formatDuration, formatSpeed } from "../utils/tripMath";
import { ASSUMED_KMH } from "../hooks/useTripCalculations";

const STATUS_CHIP = {
  upcoming: { label: "On the way", tone: "" },
  at: { label: "Bus is here", tone: "is-live" },
  crossed: { label: "Already passed", tone: "" },
};

// The three numbers a passenger cares about, for the stop being tracked
const TripSummary = ({ calc, busLocation, hasSignal, isSelected }) => {
  const waiting = busLocation?.status === "At stop";
  const { activeStop, activeStatus, etaSeconds, distanceKm, etaSpeedKmh, speedIsLive, reportedSpeedKmh } = calc;
  const shownSpeedKmh = reportedSpeedKmh ?? etaSpeedKmh;

  if (!activeStop) {
    return (
      <section className="trip-card trip-summary" aria-live="polite">
        <p className="trip-summary-label">Trip status</p>
        <p className="trip-summary-empty">🎉 The bus has passed every stop on this route.</p>
      </section>
    );
  }

  let etaValue = <span className="trip-skeleton" aria-label="Calculating" />;
  let etaNote = hasSignal ? "Calculating…" : "Waiting for the bus signal";
  if (activeStatus === "at") {
    etaValue = "Here";
    etaNote = "The bus is at this stop";
  } else if (activeStatus === "crossed") {
    etaValue = "Passed";
    etaNote = "The bus has already left this stop";
  } else if (etaSeconds != null) {
    etaValue = formatDuration(etaSeconds);
    etaNote = `Arrives about ${formatClock(Date.now() + etaSeconds * 1000)}`;
  }

  const showValues = hasSignal && distanceKm != null;
  const chip = STATUS_CHIP[activeStatus] || STATUS_CHIP.upcoming;

  return (
    <section className="trip-card trip-summary" aria-live="polite">
      <div className="trip-summary-head">
        <div>
          <p className="trip-summary-label">{isSelected ? "Tracking stop" : "Next stop"}</p>
          <h2 className="trip-summary-stop">{activeStop.name || "Unnamed stop"}</h2>
        </div>
        <span className={`trip-chip ${chip.tone}`}>{chip.label}</span>
      </div>

      {waiting && (
        <div className="trip-wait-banner" role="status">
          <strong>🛑 Bus stopped at {busLocation.currentStop}</strong>
          <span>Waiting time left: {busLocation.waitSeconds}s · Speed 0 km/h</span>
        </div>
      )}

      <div className="trip-tiles">
        <div className="trip-tile is-eta">
          <span className="trip-tile-label">ETA</span>
          <span className="trip-tile-value">{etaValue}</span>
          <span className="trip-tile-note">{etaNote}</span>
        </div>

        <div className="trip-tile">
          <span className="trip-tile-label">Distance</span>
          <span className="trip-tile-value">
            {showValues ? formatDistance(distanceKm) : <span className="trip-skeleton" />}
          </span>
          <span className="trip-tile-note">straight line</span>
        </div>

        <div className="trip-tile">
          <span className="trip-tile-label">Speed</span>
          <span className="trip-tile-value">
            {showValues ? formatSpeed(shownSpeedKmh).replace(" km/h", "") : <span className="trip-skeleton" />}
            {showValues && <small> km/h</small>}
          </span>
          <span className="trip-tile-note">{waiting ? "waiting at stop" : busLocation?.status === "Slow traffic" ? "slow traffic" : reportedSpeedKmh === 0 ? "stopped" : reportedSpeedKmh != null || speedIsLive ? "live" : `assumed ${ASSUMED_KMH} km/h`}</span>
        </div>
      </div>
    </section>
  );
};

export default TripSummary;
